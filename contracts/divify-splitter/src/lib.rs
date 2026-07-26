#![no_std]
use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, symbol_short, token, Address, Env,
    String, Symbol, Vec,
};

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    ExpenseNotFound = 1,
    AlreadyPaid = 2,
    NotPayer = 3,
    NoParticipants = 4,
    InvalidAmount = 5,
    Unauthorized = 6,
    AlreadyCancelled = 7,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Expense {
    pub payer: Address,
    pub description: String,
    pub total_amount: i128,
    pub token: Address,
    pub participants: Vec<Address>,
    pub settled: bool,
    pub cancelled: bool,
}

#[contracttype]
pub enum DataKey {
    ExpenseCount,
    Expense(u64),
    PayerExpenses(Address),
}

#[contract]
pub struct DivifyContract;

const BUMP_AMOUNT: u32 = 100_000;
const BUMP_THRESHOLD: u32 = 50_000;

#[contractimpl]
impl DivifyContract {
    /// Creates a new expense.
    ///
    /// # Arguments
    /// * `env` - The execution environment.
    /// * `payer` - The address of the user who paid the expense.
    /// * `description` - A description of the expense.
    /// * `total_amount` - The total amount of the expense.
    /// * `token` - The address of the token used for the expense.
    /// * `participants` - A list of addresses that owe the payer.
    pub fn create_expense(
        env: Env,
        payer: Address,
        description: String,
        total_amount: i128,
        token: Address,
        participants: Vec<Address>,
    ) -> Result<u64, Error> {
        payer.require_auth();

        if total_amount <= 0 {
            return Err(Error::InvalidAmount);
        }

        if participants.is_empty() {
            return Err(Error::NoParticipants);
        }

        let mut count: u64 = env.storage().persistent().get(&DataKey::ExpenseCount).unwrap_or(0);
        count += 1;

        let expense = Expense {
            payer: payer.clone(),
            description,
            total_amount,
            token,
            participants,
            settled: false,
            cancelled: false,
        };

        env.storage().persistent().set(&DataKey::Expense(count), &expense);
        env.storage().persistent().set(&DataKey::ExpenseCount, &count);

        let mut payer_expenses: Vec<u64> = env
            .storage()
            .persistent()
            .get(&DataKey::PayerExpenses(payer.clone()))
            .unwrap_or(Vec::new(&env));
        payer_expenses.push_back(count);
        env.storage()
            .persistent()
            .set(&DataKey::PayerExpenses(payer.clone()), &payer_expenses);

        env.storage().persistent().extend_ttl(&DataKey::Expense(count), BUMP_THRESHOLD, BUMP_AMOUNT);
        env.storage().persistent().extend_ttl(&DataKey::ExpenseCount, BUMP_THRESHOLD, BUMP_AMOUNT);
        env.storage().persistent().extend_ttl(&DataKey::PayerExpenses(payer), BUMP_THRESHOLD, BUMP_AMOUNT);

        Ok(count)
    }

    /// Splits the expense and pays the participants from the payer's wallet.
    ///
    /// # Arguments
    /// * `env` - The execution environment.
    /// * `expense_id` - The ID of the expense to settle.
    /// * `payer` - The address of the payer.
    /// * `token` - The token used for the payment.
    /// * `participants` - The participants receiving the split amounts.
    pub fn split_and_pay(
        env: Env,
        expense_id: u64,
        payer: Address,
        token: Address,
        participants: Vec<Address>,
    ) -> Result<(), Error> {
        payer.require_auth();

        let mut expense: Expense = env
            .storage()
            .persistent()
            .get(&DataKey::Expense(expense_id))
            .ok_or(Error::ExpenseNotFound)?;

        if expense.cancelled {
            return Err(Error::AlreadyCancelled);
        }
        if expense.settled {
            return Err(Error::AlreadyPaid);
        }
        if expense.payer != payer {
            return Err(Error::NotPayer);
        }
        if expense.token != token {
            return Err(Error::Unauthorized);
        }
        if expense.participants.len() != participants.len() {
             return Err(Error::NoParticipants);
        }

        let num_participants = participants.len() as i128;
        let amount_per_person = expense.total_amount / num_participants;
        let token_client = token::Client::new(&env, &token);

        for participant in participants.iter() {
            token_client.transfer(&payer, &participant, &amount_per_person);
        }

        expense.settled = true;
        env.storage().persistent().set(&DataKey::Expense(expense_id), &expense);
        env.storage().persistent().extend_ttl(&DataKey::Expense(expense_id), BUMP_THRESHOLD, BUMP_AMOUNT);

        Ok(())
    }

    /// Cancels an unpaid expense.
    ///
    /// # Arguments
    /// * `env` - The execution environment.
    /// * `expense_id` - The ID of the expense.
    /// * `payer` - The payer who created the expense.
    pub fn cancel_expense(env: Env, expense_id: u64, payer: Address) -> Result<(), Error> {
        payer.require_auth();

        let mut expense: Expense = env
            .storage()
            .persistent()
            .get(&DataKey::Expense(expense_id))
            .ok_or(Error::ExpenseNotFound)?;

        if expense.payer != payer {
            return Err(Error::NotPayer);
        }
        if expense.settled {
            return Err(Error::AlreadyPaid);
        }
        if expense.cancelled {
            return Err(Error::AlreadyCancelled);
        }

        expense.cancelled = true;
        env.storage().persistent().set(&DataKey::Expense(expense_id), &expense);
        env.storage().persistent().extend_ttl(&DataKey::Expense(expense_id), BUMP_THRESHOLD, BUMP_AMOUNT);

        env.events().publish(
            (symbol_short!("cancel"), expense_id),
            expense.payer.clone(),
        );

        Ok(())
    }

    /// Gets an expense by its ID.
    pub fn get_expense(env: Env, id: u64) -> Result<Expense, Error> {
        let expense: Expense = env
            .storage()
            .persistent()
            .get(&DataKey::Expense(id))
            .ok_or(Error::ExpenseNotFound)?;
        env.storage().persistent().extend_ttl(&DataKey::Expense(id), BUMP_THRESHOLD, BUMP_AMOUNT);
        Ok(expense)
    }

    /// Gets the total number of expenses.
    pub fn get_expense_count(env: Env) -> u64 {
        let count = env.storage().persistent().get(&DataKey::ExpenseCount).unwrap_or(0);
        env.storage().persistent().extend_ttl(&DataKey::ExpenseCount, BUMP_THRESHOLD, BUMP_AMOUNT);
        count
    }

    /// Gets all expenses created by a specific payer.
    pub fn get_expenses_by_payer(env: Env, payer: Address) -> Vec<u64> {
        let expenses = env
            .storage()
            .persistent()
            .get(&DataKey::PayerExpenses(payer.clone()))
            .unwrap_or(Vec::new(&env));
        env.storage().persistent().extend_ttl(&DataKey::PayerExpenses(payer), BUMP_THRESHOLD, BUMP_AMOUNT);
        expenses
    }

    /// Returns the contract version.
    pub fn version(env: Env) -> Symbol {
        Symbol::new(&env, "2_0_0")
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Env};
    use soroban_sdk::token::{StellarAssetClient, TokenClient};

    fn setup_test() -> (Env, DivifyContractClient<'static>, Address, Address, Address, Address) {
        let env = Env::default();
        env.mock_all_auths();
        let contract_id = env.register_contract(None, DivifyContract);
        let client = DivifyContractClient::new(&env, &contract_id);
        
        let payer = Address::generate(&env);
        let p1 = Address::generate(&env);
        let p2 = Address::generate(&env);
        let token_admin = Address::generate(&env);
        
        (env, client, payer, p1, p2, token_admin)
    }

    fn create_token<'a>(env: &'a Env, admin: &Address) -> (Address, TokenClient<'a>, StellarAssetClient<'a>) {
        let token_id = env.register_stellar_asset_contract(admin.clone());
        let token_client = TokenClient::new(env, &token_id);
        let asset_client = StellarAssetClient::new(env, &token_id);
        (token_id, token_client, asset_client)
    }

    #[test]
    fn test_create_expense() {
        let (env, client, payer, p1, p2, token_admin) = setup_test();
        let (token_id, _, _) = create_token(&env, &token_admin);
        
        let participants = Vec::from_array(&env, [p1.clone(), p2.clone()]);
        let desc = String::from_str(&env, "Dinner");
        let amount = 1000;
        
        let expense_id = client.create_expense(&payer, &desc, &amount, &token_id, &participants);
        assert_eq!(expense_id, 1);
        
        let expense = client.get_expense(&expense_id);
        assert_eq!(expense.payer, payer);
        assert_eq!(expense.description, desc);
        assert_eq!(expense.total_amount, amount);
        assert_eq!(expense.participants, participants);
        assert_eq!(expense.settled, false);
        assert_eq!(expense.cancelled, false);
        
        assert_eq!(client.get_expense_count(), 1);
    }

    #[test]
    #[should_panic(expected = "Error(Contract, 5)")]
    fn test_create_expense_invalid_amount() {
        let (env, client, payer, p1, p2, token_admin) = setup_test();
        let (token_id, _, _) = create_token(&env, &token_admin);
        
        let participants = Vec::from_array(&env, [p1.clone(), p2.clone()]);
        let desc = String::from_str(&env, "Dinner");
        
        client.create_expense(&payer, &desc, &0, &token_id, &participants);
    }

    #[test]
    #[should_panic(expected = "Error(Contract, 4)")]
    fn test_create_expense_no_participants() {
        let (env, client, payer, _, _, token_admin) = setup_test();
        let (token_id, _, _) = create_token(&env, &token_admin);
        
        let participants = Vec::new(&env);
        let desc = String::from_str(&env, "Dinner");
        
        client.create_expense(&payer, &desc, &1000, &token_id, &participants);
    }

    #[test]
    fn test_split_and_pay() {
        let (env, client, payer, p1, p2, token_admin) = setup_test();
        let (token_id, token_client, asset_client) = create_token(&env, &token_admin);
        
        asset_client.mint(&payer, &2000);
        
        let participants = Vec::from_array(&env, [p1.clone(), p2.clone()]);
        let desc = String::from_str(&env, "Lunch");
        let amount = 1000; // 500 each
        
        let expense_id = client.create_expense(&payer, &desc, &amount, &token_id, &participants);
        
        client.split_and_pay(&expense_id, &payer, &token_id, &participants);
        
        assert_eq!(token_client.balance(&payer), 1000);
        assert_eq!(token_client.balance(&p1), 500);
        assert_eq!(token_client.balance(&p2), 500);
        
        let expense = client.get_expense(&expense_id);
        assert_eq!(expense.settled, true);
    }

    #[test]
    #[should_panic(expected = "Error(Contract, 2)")]
    fn test_split_and_pay_already_paid() {
        let (env, client, payer, p1, p2, token_admin) = setup_test();
        let (token_id, _, asset_client) = create_token(&env, &token_admin);
        asset_client.mint(&payer, &2000);
        
        let participants = Vec::from_array(&env, [p1.clone(), p2.clone()]);
        let desc = String::from_str(&env, "Lunch");
        
        let expense_id = client.create_expense(&payer, &desc, &1000, &token_id, &participants);
        client.split_and_pay(&expense_id, &payer, &token_id, &participants);
        client.split_and_pay(&expense_id, &payer, &token_id, &participants);
    }

    #[test]
    fn test_cancel_expense() {
        let (env, client, payer, p1, p2, token_admin) = setup_test();
        let (token_id, _, _) = create_token(&env, &token_admin);
        
        let participants = Vec::from_array(&env, [p1.clone(), p2.clone()]);
        let desc = String::from_str(&env, "Party");
        let amount = 5000;
        
        let expense_id = client.create_expense(&payer, &desc, &amount, &token_id, &participants);
        client.cancel_expense(&expense_id, &payer);
        
        let expense = client.get_expense(&expense_id);
        assert_eq!(expense.cancelled, true);
    }

    #[test]
    #[should_panic(expected = "Error(Contract, 7)")]
    fn test_cancel_already_cancelled() {
        let (env, client, payer, p1, p2, token_admin) = setup_test();
        let (token_id, _, _) = create_token(&env, &token_admin);
        
        let participants = Vec::from_array(&env, [p1.clone(), p2.clone()]);
        let desc = String::from_str(&env, "Party");
        
        let expense_id = client.create_expense(&payer, &desc, &5000, &token_id, &participants);
        client.cancel_expense(&expense_id, &payer);
        client.cancel_expense(&expense_id, &payer); // Should panic
    }

    #[test]
    fn test_get_expenses_by_payer() {
        let (env, client, payer, p1, p2, token_admin) = setup_test();
        let (token_id, _, _) = create_token(&env, &token_admin);
        
        let participants = Vec::from_array(&env, [p1.clone(), p2.clone()]);
        
        client.create_expense(&payer, &String::from_str(&env, "E1"), &100, &token_id, &participants);
        client.create_expense(&payer, &String::from_str(&env, "E2"), &200, &token_id, &participants);
        
        let payer_expenses = client.get_expenses_by_payer(&payer);
        assert_eq!(payer_expenses.len(), 2);
        assert_eq!(payer_expenses.get(0).unwrap(), 1);
        assert_eq!(payer_expenses.get(1).unwrap(), 2);
    }

    #[test]
    fn test_version() {
        let (env, client, _, _, _, _) = setup_test();
        let version = client.version();
        assert_eq!(version, Symbol::new(&env, "2_0_0"));
    }
}
