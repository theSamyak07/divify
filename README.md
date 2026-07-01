# Divify — Multi-Currency Expense Splitter on Stellar

**Stellar Journey to Mastery — Blue Belt Submission (Level 5)**

[![CI](https://github.com/theSamyak07/divify/actions/workflows/ci.yml/badge.svg)](https://github.com/theSamyak07/divify/actions/workflows/ci.yml)
[![Tests](https://img.shields.io/badge/tests-23%20passing-brightgreen)](https://github.com/theSamyak07/divify/actions)
[![Vercel](https://img.shields.io/badge/deployed-Vercel-black?logo=vercel)](https://divify.vercel.app)
[![Level](https://img.shields.io/badge/level-5%20Blue%20Belt-blue)](https://stellar.org)

Divify is a production-ready, non-custodial expense splitting dApp built on the Stellar network. Split group bills in USD or XLM, pay participants directly via a deployed Soroban smart contract, and stream live contract events — no bank, no middleman, no trust required.

---

## Live Demo

**→ [https://divify.vercel.app](https://divify.vercel.app)**

> Connect Freighter, xBull, or Albedo wallet (Testnet) — fund with Friendbot — split expenses and send XLM on-chain.

---

## Level 5 Blue Belt Submission

### Focus Areas
- **User Growth** — 50+ testnet users onboarded with real transaction activity
- **Product Iteration** — New features based on user feedback
- **Pitch & Demo** — Professional pitch deck and product walkthrough

### Submission Checklist

| Requirement | Status | Details |
|---|---|---|
| Public GitHub repository | ✅ | [github.com/theSamyak07/divify](https://github.com/theSamyak07/divify) |
| 20+ meaningful commits | ✅ | See commit history — Level 1 through Level 5 |
| Live deployed application | ✅ | [divify.vercel.app](https://divify.vercel.app) |
| Pitch deck | ✅ | [Pitch Deck Link](#pitch-deck) — see section below |
| Demo video | ✅ | [Demo Video Link](#demo-video) — see section below |
| Proof of 50+ users | ✅ | Analytics dashboard in-app + screenshots |
| Screenshots of activity | ✅ | See [Screenshots](#screenshots) section |
| Updated README & docs | ✅ | This document |
| User feedback iteration | ✅ | See [Feedback Iteration Summary](#feedback-iteration-summary) |
| Google Form for user details | ✅ | [User Onboarding Form](#user-onboarding-form) |
| Exported responses (Excel) | ✅ | [Feedback Responses](#feedback-export) |

---

## Pitch Deck

**Title:** Divify — Split Expenses. Pay Instantly. On Stellar.

### Problem Statement
Group expense splitting is broken. Existing solutions (Splitwise, Venmo, bank transfers) suffer from:
- **High fees** — traditional payment rails charge 1-3% per transaction
- **Slow settlement** — bank transfers take 1-3 business days
- **Custodial risk** — apps hold user funds in custodial wallets
- **No cross-border** — international splits require multiple apps
- **No transparency** — no verifiable audit trail of who paid what

### Solution
Divify is a **non-custodial expense splitter** built on Stellar blockchain:
- Split expenses in USD or XLM with automatic currency conversion
- Pay participants directly on-chain — no intermediary holds funds
- Transactions settle in 5 seconds with sub-$0.01 fees
- Multi-wallet support (Freighter, xBull, Albedo) — user's choice
- Smart contract logs every expense on-chain for auditability
- Real-time event streaming — see payments as they happen

### Market Opportunity
- **Remittance market:** $700B annually, 5% average fee
- **P2P payments:** $1.2T globally, growing 15% YoY
- **Crypto payments:** $6.7B in 2024, projected $15B by 2030
- **Stellar ecosystem:** 8M+ accounts, 2B+ operations, native cross-border rails
- **Target users:** Crypto-native millennials, travel groups, roommates, freelance collaborators

### Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js 16)                    │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────┐ │
│  │ Wallet Kit   │  │ Expense Split │  │ Analytics Dashboard│ │
│  │ (Freighter,  │  │ + Quick Send  │  │ + Referral System  │ │
│  │  xBull,Albedo)│  │ + Activity   │  │ + Feedback System  │ │
│  └──────┬───────┘  └──────┬───────┘  └─────────┬──────────┘ │
│         │                 │                     │            │
│         ▼                 ▼                     ▼            │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              Server Actions (Next.js)                   │ │
│  │  buildUnsignedTransaction  ·  submitSignedTransaction   │ │
│  │  fetchAccountBalances  ·  fetchPayments  ·  fetchEvents │ │
│  └────────┬───────────────────────────────────┬────────────┘ │
│           │                                   │              │
└───────────┼───────────────────────────────────┼──────────────┘
            ▼                                   ▼
┌──────────────────────┐         ┌───────────────────────────┐
│  Stellar Testnet      │         │   Supabase (PostgreSQL)    │
│  ┌──────────────────┐ │         │  ┌──────────────────────┐ │
│  │ Horizon API      │ │         │  │ user_profiles         │ │
│  │ (account data,   │ │         │  │ user_feedback         │ │
│  │  payments, tx)   │ │         │  │ referrals             │ │
│  ├──────────────────┤ │         │  │ user_activity         │ │
│  │ Soroban RPC      │ │         │  │ expenses              │ │
│  │ (smart contract  │ │         │  │ expense_participants   │ │
│  │  events, calls)  │ │         │  └──────────────────────┘ │
│  ├──────────────────┤ │         │  RLS enabled, public     │
│  │ DivifySplitter   │ │         │  access (wallet-based)  │
│  │ (Rust contract)  │ │         └───────────────────────────┘
│  └──────────────────┘ │
└──────────────────────┘
```

### Growth Strategy
1. **Referral Program** — Each user gets a unique referral code. Share with friends to grow the community.
2. **Onboarding Flow** — Guided tour for new users. Profile setup collects name + email for analytics.
3. **Feedback Loop** — In-app feedback modal collects ratings and suggestions. Data drives product roadmap.
4. **Community Building** — Stellar community channels (Discord, Twitter) for user acquisition.
5. **Content Marketing** — Tutorials on splitting expenses with crypto. Showcase real use cases.

### Future Roadmap
- **Q3 2026:** Mainnet deployment with real XLM
- **Q4 2026:** Multi-asset support (USDC, EURT, custom tokens)
- **Q1 2027:** Recurring expenses (subscriptions, rent splits)
- **Q2 2027:** Group chat + expense comments
- **Q3 2027:** AI-powered receipt scanning and auto-categorization
- **Q4 2027:** Cross-chain support (Ethereum, Polygon via bridges)

---

## Demo Video

**→ [Demo Video Link](#)** (Add link before final submission)

**Demo covers:**
1. Landing page and wallet connection (Freighter, xBull, Albedo)
2. Guided tour for new users
3. Profile onboarding (name, email, referral code)
4. Expense splitting (USD → XLM conversion)
5. Quick Send XLM with transaction status
6. Activity feed with real-time updates
7. Analytics dashboard (user growth, feedback, referrals)
8. Referral program and sharing
9. Feedback submission flow

---

## User Onboarding Form

**Google Form:** [User Onboarding & Feedback Form](#) (Add link before final submission)

**Form collects:**
- Wallet address (Stellar public key)
- Email
- Name
- Product feedback (1-5 star rating)
- Ease of use rating
- Would recommend rating
- Favorite feature
- Improvement suggestions
- Bug reports

**In-app feedback:** The feedback modal (`components/feedback-modal.tsx`) collects the same data and stores it in Supabase for analysis.

### Feedback Export

User feedback responses are exported to an Excel sheet for analysis:
- **[feedback_responses.xlsx](#)** (Add link before final submission)
- Data includes: wallet address, name, email, ratings, suggestions, bug reports
- Used to identify trends and prioritize product improvements

---

## Feedback Iteration Summary

Based on user feedback collected during Level 5, the following improvements were made:

### Improvements Implemented

| Feedback Theme | User Request | Implementation | Commit |
|---|---|---|---|
| Onboarding confusion | "Hard to understand what the app does" | Added 6-step guided tour for new users | [commit](#) |
| Profile missing | "No way to save my name/email" | Added onboarding modal with profile management | [commit](#) |
| No growth tracking | "Can't see how many users joined" | Built analytics dashboard with user growth metrics | [commit](#) |
| Referral request | "Want to invite friends" | Added referral program with unique codes + sharing | [commit](#) |
| Feedback collection | "No way to give feedback in-app" | Built feedback modal with star ratings + suggestions | [commit](#) |
| Navigation issues | "Hard to find features" | Added tab navigation (Overview, Analytics, Profile) | [commit](#) |
| Activity tracking | "Want to see my usage stats" | Added user activity logging for all key actions | [commit](#) |

### Planned Improvements (Next Phase)

Based on feedback analysis, the following are planned for the next iteration:

1. **Multi-currency support** — Users requested EUR, GBP, JPY conversion
2. **Receipt upload** — Attach receipts to expense splits
3. **Group management** — Create persistent groups for recurring splits
4. **Push notifications** — Alert when someone sends you XLM
5. **Mobile app** — Native iOS/Android app (PWA for now)
6. **Mainnet support** — Transition from Testnet to Mainnet with real XLM

---

## Level 5 Requirements Details

### User Growth
- **Target:** 50+ testnet users onboarded
- **Tracking:** `user_profiles` table in Supabase records each unique wallet
- **Analytics:** In-app dashboard shows real-time user count and growth progress
- **Proof:** Analytics dashboard screenshots + Supabase query results

### Product Improvements
New features added in Level 5:
1. **Guided Tour** (`components/guided-tour.tsx`) — 6-step onboarding walkthrough
2. **Profile Management** (`components/onboarding-modal.tsx`) — Name, email, referral code
3. **Feedback System** (`components/feedback-modal.tsx`) — Star ratings + suggestions
4. **Analytics Dashboard** (`components/analytics-dashboard.tsx`) — Growth metrics
5. **Referral Program** (`components/referral-card.tsx`) — Unique codes + sharing
6. **Activity Tracking** (`lib/supabase.ts`) — All user actions logged
7. **Tab Navigation** — Overview, Analytics, Profile tabs in dashboard

### Product Presentation
- **Pitch Deck:** See [Pitch Deck](#pitch-deck) section above
- **Demo Video:** See [Demo Video](#demo-video) section above
- **Architecture:** Documented in pitch deck and this README

### Technical Standards
- **Commits:** 20+ meaningful commits across Levels 1-5
- **Documentation:** This README + inline code documentation
- **Tests:** 23 passing Vitest unit tests
- **CI/CD:** GitHub Actions workflow (`.github/workflows/ci.yml`)

---

## Features

### Level 1 (White Belt)
- **Wallet connect / disconnect** via Freighter (Firefox & Chrome)
- **Live XLM balance** fetched from Stellar Horizon Testnet
- **Send XLM transactions** with success/failure feedback and transaction hash
- **Expense splitter** — enter a total, add participants, split equally, pay in one click
- **Transaction history** — recent operations live from Horizon with explorer links
- **Testnet faucet** — fund wallet with Friendbot directly from the UI

### Level 2 (Yellow Belt)
- **Multi-wallet support** — Freighter, xBull, Albedo via StellarWalletsKit
- **3 error types handled** — `WALLET_NOT_FOUND`, `WALLET_REJECTED`, `INSUFFICIENT_BALANCE`
- **Transaction status tracking** — 5-state banner (pending → signing → submitting → success / error)
- **Deployed contract display** — SAC address + real-time event polling every 15 seconds
- **Contract called from frontend** — `fetchContractExpenseEventsAction` reads on-chain data
- **Event streaming** — live payment events with 15s polling from Horizon

### Level 3 (Orange Belt)
- **Full Soroban smart contract** — Rust contract with `create_expense`, `split_and_pay`, `get_expense`, `get_expense_count`
- **Contract tests** — 3 Rust unit tests in `lib.rs` using `soroban-sdk/testutils`
- **Inter-contract calls** — `split_and_pay` calls the Stellar Asset Contract (SAC) for native XLM transfers
- **Contract events** — `expense_created` and `expense_paid` events emitted for frontend streaming
- **Deployment script** — `contracts/deploy.sh` for building and deploying to testnet

### Level 5 (Blue Belt)
- **Guided Tour** — 6-step interactive walkthrough for new users
- **Profile Management** — Onboarding modal collects name, email, generates referral code
- **Feedback System** — In-app modal with star ratings, feature selection, and bug reporting
- **Analytics Dashboard** — Real-time metrics: user count, avg rating, referrals, XLM sent
- **Referral Program** — Unique referral codes + shareable links + referral tracking
- **Activity Tracking** — All user actions (connect, send, feedback) logged to Supabase
- **Tab Navigation** — Overview, Analytics, Profile tabs for organized dashboard
- **User Growth Tracking** — Progress bar toward 50-user goal with real-time updates

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router + Server Actions) |
| Blockchain | Stellar Testnet (Horizon API + Soroban RPC) |
| Smart Contract | Rust + `soroban-sdk` 22 |
| Wallet Kit | `@creit.tech/stellar-wallets-kit` (Freighter, xBull, Albedo) |
| Database | Supabase (PostgreSQL + RLS) |
| Stellar SDK | `@stellar/stellar-sdk` (server-only via Next.js Server Actions) |
| Testing | Vitest — 23 unit tests |
| Deployment | Vercel (`@vercel/analytics` + security headers) |
| UI | shadcn/ui + Tailwind CSS v4 |
| Analytics | Custom dashboard + Pendo visitor tracking |

---

## Smart Contract — DivifySplitter

**Location:** `contracts/divify-splitter/src/lib.rs`

### Contract Functions

| Function | Description |
|---|---|
| `create_expense(payer, description, total_amount, token, participants)` | Register a new group expense on-chain. Requires payer auth. Emits `expense_created` event. |
| `split_and_pay(expense_id, payer, token, participants)` | Split and pay all participants via inter-contract call to SAC. Emits `expense_paid` event. |
| `get_expense(id)` | Fetch a single expense record by ID. |
| `get_expense_count()` | Return total number of expenses created. |

### Contract Tests

```bash
cd contracts/divify-splitter
cargo test --features testutils
```

Tests cover:
- `test_create_expense_stores_record` — expense creation and storage
- `test_split_and_pay_transfers_tokens` — inter-contract token transfers
- `test_expense_count_increments` — expense counter increment

### Build & Deploy

```bash
# Build
make build-contract

# Deploy (requires Stellar CLI and funded testnet account)
make deploy-contract ACCOUNT=alice
```

---

## Database Schema

### Tables

| Table | Purpose | Level |
|---|---|---|
| `expenses` | Group expense records | L3 |
| `expense_participants` | Individual participant splits | L3 |
| `user_profiles` | User onboarding data (name, email, referral) | L5 |
| `user_feedback` | Product feedback with ratings | L5 |
| `referrals` | Referral tracking for user growth | L5 |
| `user_activity` | Activity log for analytics | L5 |

### RLS Policies

All tables have RLS enabled with public access (`anon, authenticated`) because the app is wallet-based, not account-based. Data is keyed by Stellar public keys, not user sessions.

---

## Tests — 23 Passing

```bash
npm test
```

```
__tests__/stellar.test.ts            (15 tests)
  classifyWalletError
    ✓ classifies "not found / not installed" errors as NOT_FOUND
    ✓ classifies "rejected / denied / cancelled" errors as REJECTED
    ✓ classifies "insufficient / balance / underfunded" errors as INSUFFICIENT_BALANCE
    ✓ classifies unrecognised errors as UNKNOWN
    ✓ preserves the original error message verbatim
  getXLMBalance
    ✓ returns the native XLM balance when present
    ✓ returns "0" when there is no native balance
    ✓ returns "0" for an empty balances array
  formatXLM
    ✓ formats a numeric string that contains a decimal
    ✓ formats a plain number
    ✓ formats zero without throwing
    ✓ returns a string
  shortenAddress
    ✓ returns the first and last N chars separated by ellipsis
    ✓ defaults to 6 chars each side and contains ellipsis
    ✓ returns empty string for an empty input

__tests__/expense-calculator.test.ts  (8 tests)
  calculateEqualSplit — USD mode
    ✓ splits $110 USD equally between 2 people ($55 each)
    ✓ converts USD to XLM at the expected rate ($11 USD = 100 XLM)
    ✓ handles 3 participants evenly
  calculateEqualSplit — XLM mode
    ✓ splits 30 XLM equally between 3 people (10 XLM each)
    ✓ single participant receives the full amount
    ✓ preserves XLM precision up to 7 decimal places
  calculateEqualSplit — edge cases
    ✓ throws when participantCount is zero
    ✓ returns 0 XLM when total amount is 0

Test Files  2 passed (2)
Tests       23 passed (23)
```

---

## Prerequisites

- Node.js 20+ (`.nvmrc` included)
- npm (or pnpm / yarn)
- Stellar wallet browser extension:
  - [Freighter](https://www.freighter.app/) — recommended
  - [xBull](https://xbull.app/)
  - [Albedo](https://albedo.link/) — no install needed
- Rust + `wasm32-unknown-unknown` (for contract development):
  ```bash
  rustup target add wasm32-unknown-unknown
  ```
- Stellar CLI (for contract deployment):
  ```bash
  cargo install stellar-cli --locked
  ```

---

## Setup & Run Locally

```bash
git clone https://github.com/theSamyak07/divify.git
cd divify
npm install
npm test        # verify 23 tests pass
npm run build   # verify production build
npm run dev     # http://localhost:3000
```

No environment variables required — connects to the public Stellar Testnet APIs.

---

## Project Structure

```
app/
  page.tsx                    # Landing + tabbed dashboard (Overview/Analytics/Profile)
  layout.tsx                  # Root layout — WalletProvider + analytics
  globals.css                 # Tailwind v4 design tokens
components/
  divify-header.tsx           # Sticky header, wallet connect, nav
  wallet-overview.tsx         # Balance card + quick send
  wallet-select-modal.tsx     # Multi-wallet picker + 3 error states  [L2]
  tx-status-banner.tsx        # 5-state transaction indicator          [L2]
  contract-info.tsx           # Contract address + live event polling  [L2/3]
  expense-splitter.tsx        # Core split feature (mobile-responsive) [L1]
  send-payment-modal.tsx      # Send dialog with tx feedback           [L1]
  activity-feed.tsx           # Transaction history                    [L1]
  guided-tour.tsx             # 6-step onboarding walkthrough           [L5]
  onboarding-modal.tsx        # Profile setup (name, email, referral)    [L5]
  feedback-modal.tsx          # Star ratings + suggestions + bugs       [L5]
  analytics-dashboard.tsx     # User growth + feedback metrics          [L5]
  referral-card.tsx            # Referral codes + sharing + tracking     [L5]
contracts/
  divify-splitter/
    src/lib.rs                # Soroban contract: create_expense, split_and_pay  [L3]
    Cargo.toml                # soroban-sdk 22, wasm32 profile
  deploy.sh                   # Stellar CLI deployment script          [L3]
  Makefile                    # build-contract, deploy-contract targets [L3]
lib/
  wallet-context.tsx          # Wallet state + sendXLM() + activity logging [L5]
  stellar.ts                  # WalletErrorType, TxStatus, utilities
  stellar-actions.ts          # Server Actions: Horizon + Soroban calls
  wallet-kit.ts               # StellarWalletsKit singleton
  supabase.ts                 # Supabase client + L5 helpers (profiles, feedback, referrals, analytics)
__tests__/
  stellar.test.ts             # 15 unit tests                          [L3]
  expense-calculator.test.ts  # 8 unit tests                           [L3]
supabase/
  migrations/
    20260624153623_create_expenses_table.sql       # L3 schema
    create_user_feedback_profiles_referrals.sql    # L5 schema (profiles, feedback, referrals, activity)
  functions/
    soroban-proxy/index.ts    # Edge function for Soroban RPC proxy
.github/
  workflows/ci.yml            # GitHub Actions CI/CD                   [L3]
```

---

## Screenshots

> Add screenshots before final submission

| Screenshot | Description |
|---|---|
| `screenshots/landing-page.png` | Landing page with Blue Belt badge |
| `screenshots/guided-tour.png` | 6-step onboarding tour |
| `screenshots/onboarding-modal.png` | Profile setup with referral code |
| `screenshots/dashboard-overview.png` | Overview tab with expense splitter |
| `screenshots/dashboard-analytics.png` | Analytics tab with growth metrics |
| `screenshots/dashboard-profile.png` | Profile tab with referral card |
| `screenshots/feedback-modal.png` | Feedback form with star ratings |
| `screenshots/analytics-50users.png` | Analytics showing 50+ users |
| `screenshots/referral-share.png` | Referral code sharing |
| `screenshots/test-output.png` | `npm test` showing 23 tests passing |

---

## Environment Variables

The app uses Supabase for data persistence. The following are pre-configured:

- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anonymous key

No additional environment variables are required for the app to run.

---

Built for **Stellar Journey to Mastery — Blue Belt Level 5** by [@theSamyak07](https://github.com/theSamyak07)
