//! # DivifySplitter — Soroban Smart Contract
//!
//! On-chain expense tracking and XLM splitting for the Divify dApp.
//!
//! ## Architecture
//! - Stores expense records in contract persistent storage.
//! - `split_and_pay` performs **inter-contract calls** to the Stellar Asset
//!   Contract (SAC) for native XLM, transferring tokens directly from the
//!   payer to every participant in a single transaction.
//! - All state mutations emit contract events that the frontend streams in
//!   real-time via Soroban RPC's `getEvents` endpoint.
//!
//! ## Deployment (Stellar Testnet)
//! ```sh
//! stellar contract build
//! stellar contract deploy \
//!   --wasm target/wasm32-unknown-unknown/release/divify_splitter.wasm \
//!   --network testnet \
//!   --source YOUR_ACCOUNT
//! ```

#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype,
    token::Client as TokenClient,
    Address, Env, Symbol, Vec,
};

// ---------------------------------------------------------------------------
// Storage keys
// ---------------------------------------------------------------------------

#[contracttype]
pub enum DataKey {
    /// Running count of all created expenses — used to generate unique IDs.
    ExpenseCount,
    /// Individual expense record keyed by its numeric ID.
    Expense(u64),
}

// ---------------------------------------------------------------------------
// Data types
// ---------------------------------------------------------------------------

/// An on-chain expense record created when a payer initiates a group split.
#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub struct Expense {
    /// Auto-incremented, 1-indexed identifier.
    pub id: u64,
    /// Stellar address of the account that created the expense.
    pub payer: Address,
    /// Short human-readable description (e.g. "Tokyo dinner").
    pub description: Symbol,
    /// Total amount in stroops (1 XLM = 10_000_000 stroops).
    pub total_amount: i128,
    /// Number of participants the amount is split across.
    pub participant_count: u32,
    /// Ledger timestamp at creation time (seconds since Unix epoch).
    pub timestamp: u64,
    /// Address of the token contract used for payment (native SAC or custom token).
    pub token: Address,
    /// Whether `split_and_pay` has been called for this expense.
    pub paid: bool,
}

// ---------------------------------------------------------------------------
// Contract
// ---------------------------------------------------------------------------

#[contract]
pub struct DivifySplitterContract;

#[contractimpl]
impl DivifySplitterContract {
    // -----------------------------------------------------------------------
    // Write functions
    // -----------------------------------------------------------------------

    /// Register a new group expense on-chain.
    ///
    /// The payer's authorization is required. Emits an `expense_created` event
    /// that the frontend can stream via Soroban RPC `getEvents`.
    ///
    /// # Arguments
    /// * `payer`         – Address paying for (and authorising) the expense.
    /// * `description`   – Short label for the expense.
    /// * `total_amount`  – Amount **in stroops** (i128). 1 XLM = 10_000_000.
    /// * `token`         – Address of the token contract (use the XLM SAC for
    ///                     native XLM: `CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC`).
    /// * `participants`  – Ordered list of participant Stellar addresses.
    ///
    /// # Returns
    /// The new expense's unique ID.
    pub fn create_expense(
        env: Env,
        payer: Address,
        description: Symbol,
        total_amount: i128,
        token: Address,
        participants: Vec<Address>,
    ) -> u64 {
        // Require the payer to have signed this transaction.
        payer.require_auth();

        let count: u64 = env
            .storage()
            .instance()
            .get(&DataKey::ExpenseCount)
            .unwrap_or(0);
        let id: u64 = count + 1;

        let expense = Expense {
            id,
            payer: payer.clone(),
            description: description.clone(),
            total_amount,
            participant_count: participants.len(),
            timestamp: env.ledger().timestamp(),
            token,
            paid: false,
        };

        env.storage()
            .persistent()
            .set(&DataKey::Expense(id), &expense);
        env.storage()
            .instance()
            .set(&DataKey::ExpenseCount, &id);

        // Emit event — frontend listens via Soroban RPC getEvents
        env.events().publish(
            (Symbol::new(&env, "expense_created"), payer),
            (id, description, total_amount, participants.len()),
        );

        id
    }

    /// Split a previously created expense and pay all participants.
    ///
    /// This function performs **inter-contract calls** to the token contract
    /// (the Stellar Asset Contract for native XLM) to transfer tokens directly
    /// from the payer's account to each participant.
    ///
    /// # Arguments
    /// * `expense_id`   – ID returned by `create_expense`.
    /// * `payer`        – Must match the address that created the expense.
    /// * `token`        – Token contract address (must match the one in the expense).
    /// * `participants` – Must match the list used in `create_expense`.
    pub fn split_and_pay(
        env: Env,
        expense_id: u64,
        payer: Address,
        token: Address,
        participants: Vec<Address>,
    ) {
        payer.require_auth();

        let mut expense: Expense = env
            .storage()
            .persistent()
            .get(&DataKey::Expense(expense_id))
            .expect("Expense not found");

        assert!(!expense.paid, "Expense already paid");
        assert!(
            expense.payer == payer,
            "Only the original payer can split this expense"
        );

        let participant_count = participants.len() as i128;
        assert!(participant_count > 0, "At least one participant required");

        let per_person: i128 = expense.total_amount / participant_count;

        // ----------------------------------------------------------------
        // Inter-contract communication: call the token (SAC) contract to
        // transfer XLM from payer → each participant.
        // TokenClient wraps the standard Stellar token interface (SEP-41).
        // ----------------------------------------------------------------
        let token_client = TokenClient::new(&env, &token);

        for participant in participants.iter() {
            token_client.transfer(&payer, &participant, &per_person);
        }

        expense.paid = true;
        env.storage()
            .persistent()
            .set(&DataKey::Expense(expense_id), &expense);

        // Emit payment event
        env.events().publish(
            (Symbol::new(&env, "expense_paid"), payer),
            (expense_id, expense.total_amount),
        );
    }

    // -----------------------------------------------------------------------
    // Read functions
    // -----------------------------------------------------------------------

    /// Fetch a single expense record by its ID.
    pub fn get_expense(env: Env, id: u64) -> Expense {
        env.storage()
            .persistent()
            .get(&DataKey::Expense(id))
            .expect("Expense not found")
    }

    /// Return the total number of expenses ever created.
    pub fn get_expense_count(env: Env) -> u64 {
        env.storage()
            .instance()
            .get(&DataKey::ExpenseCount)
            .unwrap_or(0)
    }
}

// ---------------------------------------------------------------------------
// Tests (run with: cargo test --features testutils)
// ---------------------------------------------------------------------------

#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::{
        testutils::{Address as _, Ledger},
        token::{StellarAssetClient, Client as TokenClient},
        Address, Env, Symbol,
    };

    /// Helper: deploy the divify-splitter contract and return its client.
    fn setup_contract(env: &Env) -> DivifySplitterContractClient {
        let contract_id = env.register_contract(None, DivifySplitterContract);
        DivifySplitterContractClient::new(env, &contract_id)
    }

    /// Helper: deploy a mock token (stellar asset) and mint tokens to `to`.
    fn setup_token(env: &Env, admin: &Address, to: &Address, amount: i128) -> Address {
        let token_id = env.register_stellar_asset_contract_v2(admin.clone());
        let token_admin = StellarAssetClient::new(env, &token_id.address());
        token_admin.mint(to, &amount);
        token_id.address()
    }

    #[test]
    fn test_create_expense_stores_record() {
        let env = Env::default();
        env.mock_all_auths();

        let client = setup_contract(&env);
        let payer = Address::generate(&env);
        let p1 = Address::generate(&env);
        let p2 = Address::generate(&env);

        let token_admin = Address::generate(&env);
        let token = setup_token(&env, &token_admin, &payer, 100_000_000);

        let participants = soroban_sdk::vec![&env, p1.clone(), p2.clone()];
        let id = client.create_expense(
            &payer,
            &Symbol::new(&env, "Tokyo_dinner"),
            &100_000_000_i128,
            &token,
            &participants,
        );

        assert_eq!(id, 1);
        let expense = client.get_expense(&id);
        assert_eq!(expense.total_amount, 100_000_000);
        assert_eq!(expense.participant_count, 2);
        assert!(!expense.paid);
    }

    #[test]
    fn test_split_and_pay_transfers_tokens() {
        let env = Env::default();
        env.mock_all_auths();

        let client = setup_contract(&env);
        let payer = Address::generate(&env);
        let p1 = Address::generate(&env);
        let p2 = Address::generate(&env);

        let token_admin = Address::generate(&env);
        // Mint 20 XLM (20_000_000 stroops) to payer
        let token_addr = setup_token(&env, &token_admin, &payer, 20_000_000);
        let token_client = TokenClient::new(&env, &token_addr);

        let participants = soroban_sdk::vec![&env, p1.clone(), p2.clone()];
        let id = client.create_expense(
            &payer,
            &Symbol::new(&env, "AirBnB"),
            &20_000_000_i128,
            &token_addr,
            &participants,
        );

        client.split_and_pay(&id, &payer, &token_addr, &participants);

        // Each participant should receive 10 XLM (10_000_000 stroops)
        assert_eq!(token_client.balance(&p1), 10_000_000);
        assert_eq!(token_client.balance(&p2), 10_000_000);

        // Expense should be marked paid
        let expense = client.get_expense(&id);
        assert!(expense.paid);
    }

    #[test]
    fn test_expense_count_increments() {
        let env = Env::default();
        env.mock_all_auths();

        let client = setup_contract(&env);
        assert_eq!(client.get_expense_count(), 0);

        let payer = Address::generate(&env);
        let p1 = Address::generate(&env);
        let token_admin = Address::generate(&env);
        let token = setup_token(&env, &token_admin, &payer, 10_000_000);

        let participants = soroban_sdk::vec![&env, p1];

        client.create_expense(
            &payer,
            &Symbol::new(&env, "expense_one"),
            &5_000_000_i128,
            &token,
            &participants,
        );
        assert_eq!(client.get_expense_count(), 1);

        client.create_expense(
            &payer,
            &Symbol::new(&env, "expense_two"),
            &5_000_000_i128,
            &token,
            &participants,
        );
        assert_eq!(client.get_expense_count(), 2);
    }
}
