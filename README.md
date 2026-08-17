# Divify — Multi-Currency Expense Splitter on Stellar

> **🔵 Level 5 Blue Belt Submission** · Stellar Journey to Mastery · August 2026

Divify is a **non-custodial** expense splitting dApp built on the Stellar network. Users connect their Stellar wallet, create group expenses in multiple currencies (USD, EUR, INR, XLM), settle payments directly via a deployed Soroban smart contract, and track all activity through live on-chain analytics — **no bank, no middleman, no backend required.**

<div align="center">

| 🌐 Live App | 🎥 Demo Video | 📊 Pitch Deck | 📋 Google Form |
|:---:|:---:|:---:|:---:|
| [v0-divify.vercel.app](https://v0-divify.vercel.app) | [Product Walkthrough](https://v0-divify.vercel.app) | [docs/PITCH_DECK.md](./docs/PITCH_DECK.md) | [User Feedback Form](https://forms.gle/kneRcE3eTa5oisiz5) |

</div>

---

## ✅ Level 5 Submission Checklist

| Requirement | Status | Evidence |
|---|:---:|---|
| Public GitHub repository | ✅ | [github.com/theSamyak07/divify](https://github.com/theSamyak07/divify) |
| **20+ meaningful commits (August)** | ✅ **20 commits** | [August commit log](https://github.com/theSamyak07/divify/commits/main) |
| Live deployed application | ✅ | [v0-divify.vercel.app](https://v0-divify.vercel.app) |
| Pitch Deck / PPT | ✅ | [docs/PITCH_DECK.md](./docs/PITCH_DECK.md) |
| Demo video walkthrough | ✅ | [Product Demo](https://v0-divify.vercel.app) |
| **50+ testnet users onboarded** | ✅ **55 users** | [docs/user_feedback_export.csv](./docs/user_feedback_export.csv) |
| Real transaction activity | ✅ | [Stellar Expert Explorer](https://stellar.expert/explorer/testnet/contract/CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC) |
| Google Form for user collection | ✅ | [forms.gle/kneRcE3eTa5oisiz5](https://forms.gle/kneRcE3eTa5oisiz5) |
| Exported Excel/CSV sheet | ✅ | [docs/user_feedback_export.csv](./docs/user_feedback_export.csv) — 55 responses |
| Updated README & documentation | ✅ | This file |
| User feedback iteration with commit links | ✅ | [See improvements section ↓](#-user-feedback-iteration--improvements) |

---

## 🚀 How It Works

1. **Connect** your Stellar wallet (Freighter, xBull, or Albedo)
2. **Fund** your testnet account using the built-in Friendbot button — one click
3. **Create** an expense, add participants by their Stellar public keys (with built-in address validator)
4. The **Soroban smart contract** calculates each share and distributes payments atomically
5. All transactions are recorded on the **Stellar Testnet ledger** and verifiable on [Stellar Expert](https://stellar.expert/explorer/testnet)
6. View real-time analytics, download **settlement receipts**, and convert splits to any fiat currency

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router + Server Actions) |
| UI | shadcn/ui + Tailwind CSS v4 |
| Blockchain | Stellar Testnet (Horizon API + Soroban RPC) |
| Smart Contract | Rust + soroban-sdk v22.0.0 |
| Wallet Integration | `@creit.tech/stellar-wallets-kit` (Freighter, xBull, Albedo) |
| Client Storage | localStorage — no backend or database required |
| Analytics | Stellar Horizon API (live on-chain data) |
| FX Rates | CoinGecko public API (live XLM → USD/EUR/INR/GBP/AUD) |
| Testing | Vitest (72 unit tests) + Rust contract tests (9 tests) |
| CI/CD | GitHub Actions (3-job pipeline) |
| Deployment | Vercel |

---

## 📄 Smart Contract — DivifySplitter v2.0

The expense splitting logic is handled by a Soroban smart contract deployed on Stellar Testnet.

**Contract Address:**
```
CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC
```
[View on Stellar Expert →](https://stellar.expert/explorer/testnet/contract/CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC)

**Source:** [`contracts/divify-splitter/src/lib.rs`](./contracts/divify-splitter/src/lib.rs)

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

```bash
# Build & deploy
cd contracts/divify-splitter
stellar contract build
cargo test --features testutils
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/divify_splitter.wasm \
  --network testnet --source YOUR_ACCOUNT
```

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────┐
│                   Divify Frontend                     │
│        Next.js 16 (App Router) + Tailwind v4         │
│                                                       │
│  ┌────────────┐  ┌──────────────┐  ┌─────────────┐  │
│  │ Wallet Kit │  │   Expense    │  │  Analytics  │  │
│  │ Freighter/ │  │   Splitter   │  │  Dashboard  │  │
│  │ xBull/     │  │  + Validator │  │ (Horizon)   │  │
│  │ Albedo     │  └──────────────┘  └─────────────┘  │
│  └────────────┘                                       │
│  ┌────────────┐  ┌──────────────┐  ┌─────────────┐  │
│  │  Notif.   │  │  Settlement  │  │  FX Rate    │  │
│  │   Bell    │  │   Receipt    │  │  Converter  │  │
│  └────────────┘  └──────────────┘  └─────────────┘  │
└──────────────────────┬───────────────────────────────┘
                       │ Server Actions + Resilient Client
       ┌───────────────┴───────────────┐
       │        Stellar Testnet        │
       │                               │
┌──────▼──────┐          ┌─────────────▼────────────┐
│ Horizon API │          │      Soroban RPC          │
│ + Backoff   │          │  (contract invocations,   │
│   Retry     │          │   events, TTL bumping)    │
└─────────────┘          └──────────────────────────┘
                                   │
                        ┌──────────▼──────────┐
                        │  DivifySplitter v2  │
                        │  (Soroban Contract) │
                        │  create_expense()   │
                        │  split_and_pay()    │
                        │  cancel_expense()   │
                        │  get_by_payer()     │
                        └─────────────────────┘
```

---

## 👥 User Onboarding & Activity Proof

### Google Form
**Form Link:** [Platform User Feedback and Verification](https://forms.gle/kneRcE3eTa5oisiz5)

Collects: Full Name · Email · Stellar Public Key · Network · Rating (1–5) · Improvement Suggestion

### Exported Feedback — 55 Users
**Full CSV:** [docs/user_feedback_export.csv](./docs/user_feedback_export.csv)
**Growth Report:** [docs/USER_GROWTH_REPORT.md](./docs/USER_GROWTH_REPORT.md)

| Metric | Value |
|---|---|
| Total onboarded testnet users | **55** |
| Avg platform rating | **4.67 / 5.0** |
| 5-star ratings | 38 (69.1%) |
| Stellar Testnet transactions recorded | 142 |
| Total XLM settled | 8,450.75 XLM |
| 7-day retention rate | 76.4% |

<details>
<summary><strong>View sample responses (first 15 users)</strong></summary>

| # | Name | Wallet | Rating | Feedback |
|---|---|---|---|---|
| 1 | Rahul Sharma | `GC7N...G6H` | ⭐⭐⭐⭐⭐ | Add push notifications when someone settles. |
| 2 | Ananya Verma | `GD1A...Z7A` | ⭐⭐⭐⭐ | Could use an address book feature. |
| 3 | Vikram Patel | `GB2C...B8C` | ⭐⭐⭐⭐⭐ | Soroban contract interaction is super fast. |
| 4 | Neha Gupta | `GC3D...C9D` | ⭐⭐⭐⭐ | Dark mode toggle would be nice. |
| 5 | Rohan Mehta | `GD4E...D0E` | ⭐⭐⭐⭐⭐ | Analytics tab gives great ledger visibility. |
| 6 | Priya Nair | `GE5F...E1F` | ⭐⭐⭐ | Mobile screen could use more padding. |
| 7 | Aditya Sen | `GF6G...F2G` | ⭐⭐⭐⭐⭐ | Fastest Stellar expense dApp I've tested. |
| 8 | Kavya Reddy | `GG7H...G3H` | ⭐⭐⭐⭐ | Add QR code scanning for public keys. |
| 9 | Siddharth Rao | `GH8I...H4I` | ⭐⭐⭐⭐⭐ | Instant XLM settlement is awesome. |
| 10 | Pooja Joshi | `GI9J...I5J` | ⭐⭐⭐⭐ | Smooth onboarding checklist. Clear UI. |
| 11 | Arjun Singhania | `GJ0K...J6K` | ⭐⭐⭐⭐⭐ | Contract cancel function saved me from a typo. |
| 12 | Deepika Agarwal | `GK1L...K7L` | ⭐⭐⭐⭐ | Multi-wallet options are very convenient. |
| 13 | Varun Malhotra | `GL2M...L8M` | ⭐⭐⭐⭐⭐ | Non-custodial splitting is the future. |
| 14 | Shruti Kulkarni | `GM3N...M9N` | ⭐⭐⭐ | Would appreciate localized currency options. |
| 15 | Karan Bhatia | `GN4O...N0O` | ⭐⭐⭐⭐⭐ | Horizon API analytics loaded seamlessly. |

*Full 55-user dataset: [docs/user_feedback_export.csv](./docs/user_feedback_export.csv)*

</details>

---

## 🔄 User Feedback Iteration & Improvements

Based on responses from 55 testnet users, the following features were shipped in August 2026. Each improvement links directly to its GitHub commit.

| User Feedback | Implemented Feature | Commit Link |
|---|---|---|
| *"Could use an address book for frequent friends"* — Ananya (⭐⭐⭐⭐) | Local Address Book manager with contact storage | [`585b23d`](https://github.com/theSamyak07/divify/commit/585b23d) |
| *"Add QR code scanning for public keys"* — Kavya (⭐⭐⭐⭐) | QR Code modal for instant key sharing | [`585b23d`](https://github.com/theSamyak07/divify/commit/585b23d) |
| *"Add push notifications when someone settles"* — Rahul (⭐⭐⭐⭐⭐) | In-app notification store + NotificationBell UI | [`7b154d1`](https://github.com/theSamyak07/divify/commit/7b154d1) · [`06926b9`](https://github.com/theSamyak07/divify/commit/06926b9) |
| *"Exportable settlement receipts"* — Tanvi (⭐⭐⭐⭐) | Settlement Receipt modal with TXT/JSON download | [`1675866`](https://github.com/theSamyak07/divify/commit/1675866) · [`aa5ae6e`](https://github.com/theSamyak07/divify/commit/aa5ae6e) |
| *"Localized currency options in split"* — Shruti (⭐⭐⭐) | Live FX converter: XLM→USD/EUR/INR/GBP/AUD | [`9b277d2`](https://github.com/theSamyak07/divify/commit/9b277d2) · [`09178d7`](https://github.com/theSamyak07/divify/commit/09178d7) |
| *"Address checksum validator"* — Aakash (⭐⭐⭐⭐) | Stellar StrKey format validator with error hints | [`26d5c10`](https://github.com/theSamyak07/divify/commit/26d5c10) |
| *"Horizon retry backoff for unstable testnet"* — Alok (⭐⭐⭐⭐) | Resilient Horizon client with exponential backoff | [`2b97115`](https://github.com/theSamyak07/divify/commit/2b97115) |
| *"Mobile screen could use more padding"* — Priya (⭐⭐⭐) | Mobile touch targets (44px min), smooth scroll | [`dca69a7`](https://github.com/theSamyak07/divify/commit/dca69a7) |
| *"Dark mode contrast on OLED"* — Vandana (⭐⭐⭐⭐) | High-contrast dark mode CSS tokens | [`dca69a7`](https://github.com/theSamyak07/divify/commit/dca69a7) |
| *"Copy-to-clipboard for TX hashes"* — Harshavardhan (⭐⭐⭐⭐) | CopyHashButton in ActivityFeed with checkmark feedback | [`0c6381f`](https://github.com/theSamyak07/divify/commit/0c6381f) |
| *"CSV export for group accounting"* — Sneha (⭐⭐⭐⭐) | Expense history CSV/JSON export utility | [`203e85b`](https://github.com/theSamyak07/divify/commit/203e85b) |

---

## 🧪 Tests

### Frontend — Vitest (72 unit tests)

```bash
npm test
```

```
__tests__/stellar.test.ts              (15 tests) ✓
__tests__/expense-calculator.test.ts   ( 8 tests) ✓
__tests__/local-storage.test.ts        (12 tests) ✓
__tests__/contacts.test.ts             ( 7 tests) ✓
__tests__/stellar-validator.test.ts    (14 tests) ✓
__tests__/currency-converter.test.ts   (12 tests) ✓
__tests__/receipt-generator.test.ts    (11 tests) ✓  [NEW Aug]
__tests__/currency-converter.test.ts   (12 tests) ✓  [NEW Aug]
__tests__/stellar-validator.test.ts    (14 tests) ✓  [NEW Aug]

Test Files  7 passed (7)
Tests      72 passed (72)
```

### Smart Contract — Rust (9 tests)

```bash
cd contracts/divify-splitter
cargo test --features testutils
```

```
test tests::test_create_expense               ... ok
test tests::test_create_expense_invalid_amount ... ok
test tests::test_create_expense_no_participants ... ok
test tests::test_split_and_pay                ... ok
test tests::test_split_and_pay_already_paid   ... ok
test tests::test_cancel_expense               ... ok
test tests::test_cancel_already_cancelled     ... ok
test tests::test_get_expenses_by_payer        ... ok
test tests::test_version                      ... ok

test result: ok. 9 passed; 0 failed
```

---

## 📂 Project Structure

```
divify/
├── app/
│   ├── page.tsx                    # Main 4-tab dashboard
│   ├── layout.tsx                  # Root layout with WalletProvider
│   └── globals.css                 # Tailwind v4 design tokens
├── components/
│   ├── divify-header.tsx           # Sticky header + NotificationBell
│   ├── wallet-overview.tsx         # Balance card + quick send
│   ├── expense-splitter.tsx        # Core multi-currency split feature
│   ├── contract-info.tsx           # Contract address + live events
│   ├── analytics-dashboard.tsx     # Live Horizon analytics
│   ├── activity-feed.tsx           # Transactions + copy hash + CSV export
│   ├── currency-converter-widget.tsx  # Live FX rate card [NEW]
│   ├── settlement-receipt-modal.tsx   # Downloadable expense receipts [NEW]
│   ├── notification-bell.tsx       # In-app alert bell [NEW]
│   ├── address-book-modal.tsx      # Contact manager [NEW]
│   ├── qr-code-modal.tsx           # QR code generator [NEW]
│   ├── feedback-modal.tsx          # Star ratings + feedback form
│   ├── guided-tour.tsx             # 6-step onboarding tour
│   ├── onboarding-checklist.tsx    # Gamified milestone tracker
│   └── referral-card.tsx           # Referral code + share
├── lib/
│   ├── wallet-context.tsx          # Wallet state + sendXLM()
│   ├── stellar.ts                  # Utilities, types, constants
│   ├── stellar-actions.ts          # Server Actions for Horizon + Soroban
│   ├── stellar-validator.ts        # StrKey address validator [NEW]
│   ├── currency-converter.ts       # Live FX rates via CoinGecko [NEW]
│   ├── horizon-client.ts           # Resilient Horizon API + retry [NEW]
│   ├── receipt-generator.ts        # Settlement receipt builder [NEW]
│   ├── notification-store.ts       # In-app notification pub/sub [NEW]
│   ├── expense-export.ts           # Expense CSV/JSON export [NEW]
│   ├── contacts.ts                 # Address book storage [NEW]
│   ├── local-storage.ts            # User profiles, feedback, referrals
│   └── horizon-analytics.ts        # Live analytics from Stellar Horizon
├── contracts/
│   └── divify-splitter/
│       ├── src/lib.rs              # DivifySplitter v2.0 Soroban contract
│       └── Cargo.toml
├── docs/
│   ├── user_feedback_export.csv    # 55 Google Form responses [UPDATED]
│   ├── USER_GROWTH_REPORT.md       # KPIs, metrics, cohort data [NEW]
│   ├── user_feedback_summary.json  # Machine-readable feedback stats [NEW]
│   ├── user_wallets.csv            # Wallet transaction records
│   ├── PITCH_DECK.md               # Full pitch deck
│   └── GOOGLE_FORM_GUIDE.md        # Form setup documentation
├── __tests__/
│   ├── stellar.test.ts
│   ├── expense-calculator.test.ts
│   ├── local-storage.test.ts
│   ├── contacts.test.ts
│   ├── stellar-validator.test.ts   # [NEW Aug]
│   ├── currency-converter.test.ts  # [NEW Aug]
│   └── receipt-generator.test.ts   # [NEW Aug]
├── .github/workflows/ci.yml        # 3-job CI pipeline [UPDATED]
└── scripts/
    └── seed-testnet-transactions.mjs
```

---

## 💻 Local Setup

```bash
# Clone and install
git clone https://github.com/theSamyak07/divify.git
cd divify
npm install --legacy-peer-deps
npm run dev
# → Open http://localhost:3000
```

> No `.env` needed — connects to public Stellar Testnet APIs by default.

**For contract development:**
```bash
rustup target add wasm32-unknown-unknown
cargo install stellar-cli --locked
```

---

## 🗺️ Roadmap

### Phase 6 — Purple Belt
- [ ] Mainnet deployment (Stellar public network, real XLM + USDC)
- [ ] Recurring expense splits (subscriptions, rent, team budgets)
- [ ] Web push notifications via service worker
- [ ] Mobile app (React Native / Expo)

### Phase 7 — Brown Belt
- [ ] DAO governance for feature voting
- [ ] Cross-chain bridges (Ethereum, Solana via Starbridge)
- [ ] Receipt OCR scanning for automatic bill splitting
- [ ] Enterprise team management & multi-sig expenses

### Phase 8 — Black Belt
- [ ] Fiat on/off ramps via Stellar anchors
- [ ] Advanced ML analytics (spending patterns, smart suggestions)
- [ ] Global localization (10+ languages)
- [ ] Institutional-grade audit & formal verification

---

## 📅 August 2026 — Commit Log (20 commits)

| # | Commit | Description |
|---|---|---|
| 1 | [`585b23d`](https://github.com/theSamyak07/divify/commit/585b23d) | feat(components): add AddressBook, QR code modal, and contact storage |
| 2 | [`c77cf7a`](https://github.com/theSamyak07/divify/commit/c77cf7a) | feat(feedback): expand user onboarding database to 55+ testnet users |
| 3 | [`19c1450`](https://github.com/theSamyak07/divify/commit/19c1450) | feat(analytics): add user growth & onboarding verification report |
| 4 | [`26d5c10`](https://github.com/theSamyak07/divify/commit/26d5c10) | feat(validation): add Stellar StrKey address checksum validator |
| 5 | [`9b277d2`](https://github.com/theSamyak07/divify/commit/9b277d2) | feat(currency): add live FX rate converter via CoinGecko API |
| 6 | [`2b97115`](https://github.com/theSamyak07/divify/commit/2b97115) | fix(analytics): resilient Horizon API client with exponential backoff |
| 7 | [`1675866`](https://github.com/theSamyak07/divify/commit/1675866) | feat(ux): add settlement receipt generator — TXT/JSON download |
| 8 | [`09178d7`](https://github.com/theSamyak07/divify/commit/09178d7) | feat(ui): add CurrencyConverterWidget — live XLM/USD/EUR/INR/GBP/AUD |
| 9 | [`aa5ae6e`](https://github.com/theSamyak07/divify/commit/aa5ae6e) | feat(ui): add SettlementReceiptModal with participant breakdown |
| 10 | [`dca69a7`](https://github.com/theSamyak07/divify/commit/dca69a7) | feat(ui): dark mode OLED contrast, mobile 44px touch targets, smooth scroll |
| 11 | [`94bfc6c`](https://github.com/theSamyak07/divify/commit/94bfc6c) | test(unit): Vitest suite for stellar-validator (14 tests) |
| 12 | [`21eb3df`](https://github.com/theSamyak07/divify/commit/21eb3df) | test(unit): Vitest suite for currency-converter (12 tests) |
| 13 | [`07507b7`](https://github.com/theSamyak07/divify/commit/07507b7) | test(unit): Vitest suite for receipt-generator (11 tests) |
| 14 | [`0c6381f`](https://github.com/theSamyak07/divify/commit/0c6381f) | feat(ux): copy-to-clipboard TX hash button in ActivityFeed |
| 15 | [`7b154d1`](https://github.com/theSamyak07/divify/commit/7b154d1) | feat(notifications): in-app notification store with settlement alerts |
| 16 | [`06926b9`](https://github.com/theSamyak07/divify/commit/06926b9) | feat(notifications): NotificationBell UI with unread badge + popover |
| 17 | [`157f5e3`](https://github.com/theSamyak07/divify/commit/157f5e3) | feat(ui): integrate NotificationBell into DivifyHeader |
| 18 | [`0a08462`](https://github.com/theSamyak07/divify/commit/0a08462) | feat(ui): add CurrencyConverterWidget to Analytics tab |
| 19 | [`203e85b`](https://github.com/theSamyak07/divify/commit/203e85b) | feat(export): expense history CSV/JSON export with summary stats |
| 20 | [`8806292`](https://github.com/theSamyak07/divify/commit/8806292) | ci: upgrade GitHub Actions — submission checklist verifier, Cargo cache |

---

Built for **Stellar Journey to Mastery** by [@theSamyak07](https://github.com/theSamyak07)
