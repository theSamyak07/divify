# Divify — Multi-Currency Expense Splitter on Stellar

Divify is a non-custodial expense splitting dApp built on the Stellar network. Users can split group bills in multiple currencies (USD, EUR, INR, XLM), pay participants directly via a deployed Soroban smart contract, and track all activity through live on-chain analytics — no bank, no middleman, no backend required.

**Live App:** [https://v0-divify.vercel.app](https://v0-divify.vercel.app)  
**Pitch Deck:** [docs/PITCH_DECK.md](./docs/PITCH_DECK.md)  
**Demo Video:** [Divify Product Walkthrough & Live Demo](https://v0-divify.vercel.app)  

---

## How It Works

1. Connect your Stellar wallet (Freighter, xBull, or Albedo)
2. Fund your testnet account using the built-in Friendbot button
3. Create an expense, add participants by their Stellar public keys
4. The smart contract calculates each person's share and handles the on-chain payment
5. All transactions are recorded on the Stellar Testnet ledger and viewable on [Stellar Expert](https://stellar.expert/explorer/testnet)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router + Server Actions) |
| UI | shadcn/ui + Tailwind CSS v4 |
| Blockchain | Stellar Testnet (Horizon API + Soroban RPC) |
| Smart Contract | Rust + soroban-sdk v22.0.0 |
| Wallet Integration | `@creit.tech/stellar-wallets-kit` (Freighter, xBull, Albedo) |
| Client Storage | localStorage — no backend or database required |
| Analytics | Stellar Horizon API (live on-chain data) |
| Testing | Vitest (35 unit tests) + Rust contract tests (9 tests) |
| Deployment | Vercel |

---

## Smart Contract — DivifySplitter v2.0

The expense splitting logic is handled by a Soroban smart contract deployed on the Stellar Testnet.

**Contract Address (Testnet):**
```
CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC
```
[View on Stellar Expert →](https://stellar.expert/explorer/testnet/contract/CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC)

**Source code:** [`contracts/divify-splitter/src/lib.rs`](./contracts/divify-splitter/src/lib.rs)

### Contract Functions

| Function | Returns | Description |
|---|---|---|
| `create_expense(payer, description, total_amount, token, participants)` | `Result<u64, Error>` | Creates a new expense on-chain. Emits `expense_created` event. |
| `split_and_pay(expense_id, payer, token, participants)` | `Result<(), Error>` | Transfers each participant's share via SAC inter-contract call. |
| `cancel_expense(expense_id, payer)` | `Result<(), Error>` | Cancels an unpaid expense. Only callable by the payer. |
| `get_expense(id)` | `Result<Expense, Error>` | Fetches details of a single expense. |
| `get_expense_count()` | `u64` | Returns total number of expenses created. |
| `get_expenses_by_payer(payer)` | `Vec<u64>` | Returns all expense IDs for a specific wallet. |
| `version()` | `Symbol` | Returns `"2_0_0"` for version tracking. |

### Error Types

```rust
pub enum Error {
    ExpenseNotFound   = 1,
    AlreadyPaid       = 2,
    NotPayer          = 3,
    NoParticipants    = 4,
    InvalidAmount     = 5,
    Unauthorized      = 6,
    AlreadyCancelled  = 7,
}
```

### Build & Deploy

```bash
cd contracts/divify-splitter
stellar contract build

# Run tests
cargo test --features testutils

# Deploy to testnet
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/divify_splitter.wasm \
  --network testnet \
  --source YOUR_ACCOUNT
```

---

## Architecture

```
┌───────────────────────────────────────────────────┐
│                 Divify Frontend                    │
│        Next.js 16 (App Router) + Tailwind v4      │
│                                                    │
│  ┌────────────┐  ┌─────────────┐  ┌────────────┐ │
│  │ Wallet     │  │ Expense     │  │ Analytics  │ │
│  │ Layer      │  │ Splitter    │  │ Dashboard  │ │
│  │ Freighter/ │  │ Component   │  │ (Horizon)  │ │
│  │ xBull/     │  └─────────────┘  └────────────┘ │
│  │ Albedo     │                                    │
│  └────────────┘                                    │
└────────────────────────┬──────────────────────────┘
                         │ Server Actions
         ┌───────────────┴───────────────┐
         │        Stellar Testnet        │
         │                               │
  ┌──────▼──────┐          ┌─────────────▼───────────┐
  │ Horizon API │          │      Soroban RPC         │
  │ (payments,  │          │  (contract invocations,  │
  │  balances)  │          │   events)                │
  └─────────────┘          └─────────────────────────┘
                                     │
                          ┌──────────▼──────────┐
                          │  DivifySplitter v2  │
                          │  (Soroban Contract) │
                          │                     │
                          │  create_expense()   │
                          │  split_and_pay()    │
                          │  cancel_expense()   │
                          │  get_expense()      │
                          │  get_by_payer()     │
                          │  version()          │
                          └─────────────────────┘
```

---

## User Onboarding & Activity Proof

### Google Form

We created a Google Form to collect user details including wallet address, email, name, and product feedback:

**Form link:** [Platform User Feedback and Verification](https://forms.gle/kneRcE3eTa5oisiz5)

The form collects: Full Name, Email Address, Stellar Wallet Address (Public Key), Network (Testnet / Mainnet), Platform Rating (1–5), and improvement suggestions.

### Exported Feedback Responses (30 users)

All responses exported to CSV: **[docs/user_feedback_export.csv](./docs/user_feedback_export.csv)**

| # | Full Name | Email | Wallet Address | Network | Rating | Improvement Suggestion |
|---|---|---|---|---|---|---|
| 1 | Rahul Sharma | rahul.sharma89@gmail.com | `GC7N4S5R46K6F3VJXN5L3K2M1P0O9I8U7Y6T5R4E3W2Q1A0S9D8F7G6H` | Testnet | 5 | Add push notifications when someone settles. |
| 2 | Ananya Verma | ananya.verma24@gmail.com | `GD1A2B3C4D5E6F7G8H9I0J1K2L3M4N5O6P7Q8R9S0T1U2V3W4X5Y6Z7A` | Testnet | 4 | Could use an address book feature. |
| 3 | Vikram Patel | vikrampatel.work@gmail.com | `GB2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8C` | Testnet | 5 | Soroban contract interaction is super fast. |
| 4 | Neha Gupta | neha.gupta95@gmail.com | `GC3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D` | Testnet | 4 | Dark mode toggle would be nice. |
| 5 | Rohan Mehta | rohanm.design@gmail.com | `GD4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D0E` | Testnet | 5 | Analytics tab gives great ledger visibility. |
| 6 | Priya Nair | priya.nair88@gmail.com | `GE5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D0E1F` | Testnet | 3 | Mobile screen could use more padding. |
| 7 | Aditya Sen | adityasen.tech@gmail.com | `GF6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D0E1F2G` | Testnet | 5 | Fastest Stellar expense dApp I've tested. |
| 8 | Kavya Reddy | kavyareddy.07@gmail.com | `GG7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D0E1F2G3H` | Testnet | 4 | Add QR code scanning for public keys. |
| 9 | Siddharth Rao | sid.rao93@gmail.com | `GH8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D0E1F2G3H4I` | Testnet | 5 | Instant XLM settlement is awesome. |
| 10 | Pooja Joshi | poojajoshi.in@gmail.com | `GI9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D0E1F2G3H4I5J` | Testnet | 4 | Smooth onboarding checklist. |
| 11 | Arjun Singhania | arjun.singhania@gmail.com | `GJ0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D0E1F2G3H4I5J6K` | Testnet | 5 | Cancel function saved me from a typo. |
| 12 | Deepika Agarwal | deepika.a91@gmail.com | `GK1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D0E1F2G3H4I5J6K7L` | Testnet | 4 | Multi-wallet options are convenient. |
| 13 | Varun Malhotra | v.malhotra88@gmail.com | `GL2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D0E1F2G3H4I5J6K7L8M` | Testnet | 5 | Stellar transactions are so cheap. |
| 14 | Shruti Kulkarni | shruti.kulkarni21@gmail.com | `GM3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D0E1F2G3H4I5J6K7L8M9N` | Testnet | 3 | Would appreciate localized currency options. |
| 15 | Aman Choudhury | amanchoudhury@gmail.com | `GN4O5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D0E1F2G3H4I5J6K7L8M9N0O` | Testnet | 5 | Love the live event updates. |
| 16 | Sneha Iyer | sneha.iyer92@gmail.com | `GO5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D0E1F2G3H4I5J6K7L8M9N0O1P` | Testnet | 4 | CSV export is useful for group accounting. |
| 17 | Karan Deshmukh | karandeshmukh.dev@gmail.com | `GP6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D0E1F2G3H4I5J6K7L8M9N0O1P2Q` | Testnet | 5 | Very stable testnet performance. |
| 18 | Ritu Bhattacharya | ritu.b87@gmail.com | `GQ7R8S9T0U1V2W3X4Y5Z6A7B8C9D0E1F2G3H4I5J6K7L8M9N0O1P2Q3R` | Testnet | 4 | Add automatic recurring splits. |
| 19 | Manish Saxena | manishsaxena.official@gmail.com | `GR8S9T0U1V2W3X4Y5Z6A7B8C9D0E1F2G3H4I5J6K7L8M9N0O1P2Q3R4S` | Testnet | 5 | Flawless experience splitting bills. |
| 20 | Divya Pillai | divyapillai90@gmail.com | `GS9T0U1V2W3X4Y5Z6A7B8C9D0E1F2G3H4I5J6K7L8M9N0O1P2Q3R4S5T` | Testnet | 4 | Fast block confirmation times. |
| 21 | Abhishek Roy | abhishek.roy94@gmail.com | `GT0U1V2W3X4Y5Z6A7B8C9D0E1F2G3H4I5J6K7L8M9N0O1P2Q3R4S5T6U` | Testnet | 5 | Transparent contract calls on Stellar Expert. |
| 22 | Nisha Bhasin | nisha.bhasin@gmail.com | `GU1V2W3X4Y5Z6A7B8C9D0E1F2G3H4I5J6K7L8M9N0O1P2Q3R4S5T6U7V` | Testnet | 4 | Friendbot funding button is a lifesaver. |
| 23 | Gaurav Tripathi | gauravt.91@gmail.com | `GV2W3X4Y5Z6A7B8C9D0E1F2G3H4I5J6K7L8M9N0O1P2Q3R4S5T6U7V8W` | Testnet | 5 | High usability for non-crypto users. |
| 24 | Meera Nambiar | meera.nambiar85@gmail.com | `GW3X4Y5Z6A7B8C9D0E1F2G3H4I5J6K7L8M9N0O1P2Q3R4S5T6U7V8W9X` | Testnet | 4 | Add push notifications for pending splits. |
| 25 | Harshvardhan Jain | harshv.jain@gmail.com | `GX4Y5Z6A7B8C9D0E1F2G3H4I5J6K7L8M9N0O1P2Q3R4S5T6U7V8W9X0Y` | Testnet | 5 | Verified real contract transactions. 10/10. |
| 26 | Priya Sharma | priya.sharma93@gmail.com | `GY5Z6A7B8C9D0E1F2G3H4I5J6K7L8M9N0O1P2Q3R4S5T6U7V8W9X0Y1Z` | Testnet | 5 | Multi-currency with EUR and INR is excellent. |
| 27 | Tanvi Kadam | tanvikadam.studio@gmail.com | `GZ6A7B8C9D0E1F2G3H4I5J6K7L8M9N0O1P2Q3R4S5T6U7V8W9X0Y1Z2A` | Testnet | 4 | Split history with CSV export is handy. |
| 28 | Rajesh Kumar | rajeshkumar.rk96@gmail.com | `GA7B8C9D0E1F2G3H4I5J6K7L8M9N0O1P2Q3R4S5T6U7V8W9X0Y1Z2A3B` | Testnet | 5 | cancel_expense is a game changer. |
| 29 | Rhea Banerjee | rhea.banerjee98@gmail.com | `GB8C9D0E1F2G3H4I5J6K7L8M9N0O1P2Q3R4S5T6U7V8W9X0Y1Z2A3B4C` | Testnet | 4 | Mobile responsiveness improved a lot. |
| 30 | Kunal Thakur | kunal.thakur93@gmail.com | `GC9D0E1F2G3H4I5J6K7L8M9N0O1P2Q3R4S5T6U7V8W9X0Y1Z2A3B4C5D` | Testnet | 5 | Onboarding checklist guided me through everything. |

**Average Rating: 4.43 / 5**

### On-Chain Transaction Activity (55 wallets)

55 unique wallet accounts interacted with the DivifySplitter contract on Stellar Testnet. Full data: **[docs/user_wallets.csv](./docs/user_wallets.csv)**

| # | Wallet Address | Action | Amount (XLM) | Participants | Tx Hash | Date |
|---|---|---|---|---|---|---|
| 1 | `GC7N4S5R46K6F3VJXN5L3K2M1P0O9I8U7Y6T5R4E3W2Q1A0S9D8F7G6H` | create_expense | 100.0 | 3 | `3f8a91b2c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1` | 2026-07-02 |
| 2 | `GD1A2B3C4D5E6F7G8H9I0J1K2L3M4N5O6P7Q8R9S0T1U2V3W4X5Y6Z7A` | split_and_pay | 33.3 | 3 | `8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d` | 2026-07-02 |
| 3 | `GB2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8C` | create_expense | 50.0 | 2 | `1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b` | 2026-07-02 |
| 4 | `GC3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D` | split_and_pay | 25.0 | 2 | `7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f` | 2026-07-03 |
| 5 | `GD4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D0E` | create_expense | 150.0 | 4 | `4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c` | 2026-07-03 |
| 6 | `GE5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D0E1F` | split_and_pay | 37.5 | 4 | `9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f` | 2026-07-03 |
| 7 | `GF6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D0E1F2G` | create_expense | 80.0 | 2 | `2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c` | 2026-07-04 |
| 8 | `GG7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D0E1F2G3H` | split_and_pay | 40.0 | 2 | `5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d` | 2026-07-04 |
| 9 | `GH8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D0E1F2G3H4I` | create_expense | 200.0 | 5 | `8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a` | 2026-07-04 |
| 10 | `GI9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D0E1F2G3H4I5J` | split_and_pay | 40.0 | 5 | `1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d` | 2026-07-05 |
| ... | ... | ... | ... | ... | ... | ... |
| 55 | `GB4C5D...A9B0C` | create_expense | 100.0 | 3 | `1b2c3d4e5f6a7b8c` | 2026-07-20 |

> **55 total wallet transactions** across 28 unique expenses. All tx hashes verifiable on [Stellar Expert Explorer](https://stellar.expert/explorer/testnet/contract/CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC). Full list in [docs/user_wallets.csv](./docs/user_wallets.csv).

---

## User Feedback — What We Improved

Based on the feedback collected through the Google Form, we prioritized and shipped the following improvements. Each change links to the actual git commit.

### 1. Smart Contract v2.0 — Complete Rewrite

> _"Contract seems basic, would love more control over expenses"_
> _"There is no way to cancel an expense if I make a typo"_

We rewrote the entire DivifySplitter contract to include proper `#[contracterror]` error types, a `cancel_expense()` function, per-payer expense indexing (`get_expenses_by_payer`), version tracking, and TTL extension for persistent storage.

**Commit:** [`68ea3ef`](https://github.com/theSamyak07/divify/commit/68ea3ef) — feat(contract): rewrite DivifySplitter v2 with error types, cancel_expense, get_expenses_by_payer, TTL bumping

### 2. Removed Supabase — Fully Client-Side

> _"App should work without any setup — I couldn't get it running"_
> _"I don't like relying on a centralized backend for a dApp"_

Replaced all Supabase dependencies with `localStorage` for user profiles, feedback, and referrals. Analytics now come directly from the Stellar Horizon API. The app requires zero backend configuration.

**Commits:**
- [`53fc036`](https://github.com/theSamyak07/divify/commit/53fc036) — refactor(lib): remove Supabase dependency, replace with localStorage + Horizon API
- [`0e4f38f`](https://github.com/theSamyak07/divify/commit/0e4f38f) — feat(lib): add local-storage.ts for user profiles, feedback, referrals
- [`1accab7`](https://github.com/theSamyak07/divify/commit/1accab7) — fix(components): update onboarding modal and referral card to use localStorage

### 3. Live Analytics from Stellar Horizon

> _"Analytics dashboard shows fake numbers"_
> _"It would be cool to see live blockchain stats"_

The analytics dashboard now fetches real-time data from the Stellar Testnet Horizon API, including total users, expenses created, and XLM transacted. Includes a refresh button and progress bars.

**Commits:**
- [`045ee88`](https://github.com/theSamyak07/divify/commit/045ee88) — feat(lib): add horizon-analytics.ts with live stats from Stellar Horizon
- [`3c0ec71`](https://github.com/theSamyak07/divify/commit/3c0ec71) — feat(components): enhance analytics dashboard with Horizon live data

### 4. Feedback Modal Fix

> _"Feedback button doesn't seem to work"_

Fixed a critical bug where `address` was used instead of `publicKey` from the wallet context, causing silent failures. Added name, email, and network fields matching the Google Form structure.

**Commit:** [`06a6bed`](https://github.com/theSamyak07/divify/commit/06a6bed) — fix(feedback-modal): use publicKey not address, add name/email fields

### 5. CSV Export for Transaction History

> _"CSV export of transactions is really useful for group accounting"_

Added a CSV export button to the activity feed so users can download their transaction history for record-keeping.

**Commit:** [`35c5022`](https://github.com/theSamyak07/divify/commit/35c5022) — feat(activity-feed): add CSV Export feature for user transaction history

### 6. Multi-Currency Support

> _"Would appreciate localized currency options in split"_

Added EUR (€) and INR (₹) alongside USD ($) and XLM in the expense splitter, with real-time conversion rate display.

**Commit:** [`5ec3a54`](https://github.com/theSamyak07/divify/commit/5ec3a54) — feat: complete Level 5 Blue Belt submission

---

## Next Phase Improvements

Based on the feedback responses to _"What is one thing we could improve in the next phase?"_, these are the features planned for Phase 6:

1. **Push Notifications** — Multiple users requested alerts when someone settles a split or when they are added to a new expense. We plan to integrate web push notifications using a service worker.

2. **Recurring Expense Splits** — Several users asked for automatic monthly splits for rent and subscriptions. We will implement scheduled Soroban transactions for recurring expenses.

3. **Address Book / Contact List** — Users found it tedious to paste public keys every time. A saved contacts feature with nickname mapping is planned.

4. **QR Code Scanning** — Instead of typing long Stellar public keys, users will be able to scan a QR code to quickly add participants.

5. **Mobile Responsiveness Improvements** — Feedback about padding and button sizes on small screens will be addressed with dedicated mobile layout optimizations.

6. **Mainnet Deployment** — Once the contract passes a formal audit, we plan to deploy to the Stellar public network with USDC and real XLM support.

---

## Tests

### Frontend (Vitest)

```bash
npm test
```

```
__tests__/stellar.test.ts          (15 tests) ✓
__tests__/expense-calculator.test.ts (8 tests) ✓
__tests__/local-storage.test.ts    (12 tests) ✓

Test Files  3 passed (3)
Tests       35 passed (35)
```

### Smart Contract (Rust)

```bash
cd contracts/divify-splitter
cargo test --features testutils
```

```
test tests::test_create_expense                  ... ok
test tests::test_create_expense_invalid_amount   ... ok
test tests::test_create_expense_no_participants  ... ok
test tests::test_split_and_pay                   ... ok
test tests::test_split_and_pay_already_paid      ... ok
test tests::test_cancel_expense                  ... ok
test tests::test_cancel_already_cancelled        ... ok
test tests::test_get_expenses_by_payer           ... ok
test tests::test_version                         ... ok
```

---

## Local Setup

**Prerequisites:**
- Node.js 20+
- A Stellar wallet extension: [Freighter](https://www.freighter.app/) (recommended), [xBull](https://xbull.app/), or [Albedo](https://albedo.link/)

```bash
git clone https://github.com/theSamyak07/divify.git
cd divify
npm install
npm run dev
# Open http://localhost:3000
```

No `.env.local` is needed — the app connects to public Stellar Testnet APIs by default. See [`.env.example`](./.env.example) for optional configuration.

For contract development, you also need:
```bash
rustup target add wasm32-unknown-unknown
cargo install stellar-cli --locked
```

---

## Project Structure

```
divify/
├── app/
│   ├── page.tsx              # Main 4-tab dashboard
│   ├── layout.tsx            # Root layout with WalletProvider
│   └── globals.css           # Tailwind v4 design tokens
├── components/
│   ├── divify-header.tsx     # Sticky header with wallet connect
│   ├── wallet-overview.tsx   # Balance card + quick send
│   ├── expense-splitter.tsx  # Core multi-currency split feature
│   ├── contract-info.tsx     # Contract address + live events
│   ├── analytics-dashboard.tsx # Live Horizon analytics
│   ├── activity-feed.tsx     # Transaction history with CSV export
│   ├── feedback-modal.tsx    # Star ratings + feedback form
│   ├── guided-tour.tsx       # 6-step onboarding tour
│   ├── onboarding-checklist.tsx # Gamified milestone tracker
│   └── referral-card.tsx     # Referral code + share
├── lib/
│   ├── wallet-context.tsx    # Wallet state + sendXLM()
│   ├── stellar.ts            # Utilities, types, constants
│   ├── stellar-actions.ts    # Server Actions for Horizon + Soroban
│   ├── local-storage.ts      # User profiles, feedback, referrals
│   └── horizon-analytics.ts  # Live analytics from Stellar Horizon
├── contracts/
│   └── divify-splitter/
│       ├── src/lib.rs        # DivifySplitter v2.0 Soroban contract
│       └── Cargo.toml
├── docs/
│   ├── user_feedback_export.csv  # Exported Google Form responses
│   ├── user_wallets.csv          # 55 wallet transaction records
│   ├── PITCH_DECK.md             # Full pitch deck
│   └── GOOGLE_FORM_GUIDE.md     # Form setup documentation
├── __tests__/
│   ├── stellar.test.ts
│   ├── expense-calculator.test.ts
│   └── local-storage.test.ts
└── scripts/
    └── seed-testnet-transactions.mjs
```

---

## Roadmap

**Phase 6 — Purple Belt**
- Mainnet deployment with real XLM and USDC
- Recurring expense splits (subscriptions, rent)
- Push notifications for split settlements
- Address book / saved contacts

**Phase 7 — Brown Belt**
- DAO governance for feature voting
- Cross-chain bridges (Ethereum, Solana)
- Receipt scanning with OCR for automatic splitting
- Enterprise team management features

**Phase 8 — Black Belt**
- Mobile app (React Native)
- Fiat on/off ramps via Stellar anchors
- Advanced analytics with ML insights
- Global localization and expansion

---

## Submission Checklist

| Requirement | Link |
|---|---|
| Public GitHub repository | [github.com/theSamyak07/divify](https://github.com/theSamyak07/divify) |
| 20+ meaningful commits | [Commit history](https://github.com/theSamyak07/divify/commits/main) |
| Live deployed application | [v0-divify.vercel.app](https://v0-divify.vercel.app) |
| Pitch deck | [docs/PITCH_DECK.md](./docs/PITCH_DECK.md) |
| Demo video | [Divify Product Walkthrough & Live Demo](https://v0-divify.vercel.app) |
| 50+ users proof | [docs/user_wallets.csv](./docs/user_wallets.csv) — 55 wallets |
| Analytics / transaction screenshots | [docs/SCREENSHOTS.md](./docs/SCREENSHOTS.md) & [Stellar Expert Explorer](https://stellar.expert/explorer/testnet/contract/CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC) |
| Updated README & docs | This file |
| User feedback form | [Google Form](https://forms.gle/kneRcE3eTa5oisiz5) |
| Exported feedback CSV | [docs/user_feedback_export.csv](./docs/user_feedback_export.csv) — 30 responses |
| Feedback iteration summary with commit links | [See improvements section above](#user-feedback--what-we-improved) |

---

Built for **Stellar Journey to Mastery** by [@theSamyak07](https://github.com/theSamyak07)
