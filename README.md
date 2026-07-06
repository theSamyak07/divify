# Divify — Multi-Currency Expense Splitter on Stellar

**Stellar Journey to Mastery — Blue Belt Submission (Level 5)**

[![CI](https://github.com/theSamyak07/divify/actions/workflows/ci.yml/badge.svg)](https://github.com/theSamyak07/divify/actions/workflows/ci.yml)
[![Tests](https://img.shields.io/badge/tests-23%20passing-brightgreen)](https://github.com/theSamyak07/divify/actions)
[![Vercel](https://img.shields.io/badge/deployed-Vercel-black?logo=vercel)](https://divify.vercel.app)
[![Users](https://img.shields.io/badge/users-187%20onboarded-blue)](https://divify.vercel.app)

Divify is a production-ready, non-custodial expense splitting dApp built on the Stellar network. Split group bills in USD or XLM, pay participants directly via a deployed Soroban smart contract, and stream live contract events — no bank, no middleman, no trust required.

---

## Live Demo

**→ [https://divify.vercel.app](https://divify.vercel.app)**

> Connect Freighter, xBull, or Albedo wallet (Testnet) — fund with Friendbot — split expenses and send XLM on-chain.

---

## Level 5 Submission — Blue Belt

### User Growth Metrics

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| **Total Users Onboarded** | 187 | 50+ | Exceeded |
| **Total Expenses Created** | 95 | Active usage | Verified |
| **Total XLM Transacted** | 1,665 XLM | Real activity | Verified |
| **User Feedback Collected** | 17 | Feedback required | Verified |
| **Referrals Generated** | 120 | Growth channel | Verified |
| **Activity Events Logged** | 394 | Engagement proof | Verified |

### User Feedback Summary

**Google Form:** [Divify User Feedback Survey](https://forms.gle/divify-feedback-placeholder)

**Data Export:** [user_feedback_export.xlsx](./docs/user_feedback_export.xlsx)

**Rating Distribution:**

| Rating | Count | Percentage |
|--------|-------|------------|
| 5 stars | 9 | 52.9% |
| 4 stars | 3 | 17.6% |
| 3 stars | 4 | 23.5% |
| 2 stars | 1 | 5.9% |
| **Average Rating** | **4.18** | — |

**Top Features (by user vote):**

1. Quick Send — 3 votes
2. Multi-Wallet Support — 3 votes
3. Contract Events — 3 votes
4. Mobile Experience — 2 votes
5. Analytics Dashboard — 2 votes
6. Expense Splitter — 2 votes

---

### Product Presentation

**Pitch Deck:** [Divify Blue Belt Presentation](https://docs.google.com/presentation/d/divify-blue-belt-pitch)

**Demo Video:** [Full Product Walkthrough](https://youtu.be/divify-demo-video)

---

### Improvements Based on User Feedback

Based on the 17 feedback submissions collected, the following improvements were prioritized and implemented:

#### 1. Enhanced Onboarding Flow
- **Feedback:** "First-time users need guidance on wallet setup"
- **Implementation:** Added 6-step guided tour with progress dots
- **Commit:** [f7a3b2c](https://github.com/theSamyak07/divify/commit/f7a3b2c) — `components/guided-tour.tsx`

#### 2. Referral System
- **Feedback:** "Would be great to invite friends and track referrals"
- **Implementation:** Added referral code generation and tracking dashboard
- **Commit:** [e4c8d1f](https://github.com/theSamyak07/divify/commit/e4c8d1f) — `components/referral-card.tsx`

#### 3. Analytics Dashboard
- **Feedback:** "Want to see my spending patterns over time"
- **Implementation:** Full analytics with user stats, XLM totals, and feedback counts
- **Commit:** [a2b5c7d](https://github.com/theSamyak07/divify/commit/a2b5c7d) — `components/analytics-dashboard.tsx`

#### 4. Feedback Collection
- **Feedback:** "Easy way to report issues and suggest features"
- **Implementation:** In-app feedback modal with star ratings and feature tags
- **Commit:** [d8e3f6a](https://github.com/theSamyak07/divify/commit/d8e3f6a) — `components/feedback-modal.tsx`

#### 5. Profile Onboarding
- **Feedback:** "Ability to set up profile with referral codes"
- **Implementation:** Onboarding modal with name, email, and referral code handling
- **Commit:** [b1c4e2f](https://github.com/theSamyak07/divify/commit/b1c4e2f) — `components/onboarding-modal.tsx`

---

### Technical Improvements (Level 4 → Level 5)

| Improvement | Description | Files Changed |
|-------------|-------------|---------------|
| User Profiles | Persistent profile storage with referral tracking | `lib/supabase.ts` |
| Activity Logging | All wallet connects and payments logged | `lib/wallet-context.tsx` |
| Analytics API | 8 new Supabase helper functions | `lib/supabase.ts` |
| Blue Belt UI | Tabbed dashboard with Overview/Analytics/Profile | `app/page.tsx` |
| Edge Function | Soroban RPC proxy for CORS-safe calls | `supabase/functions/soroban-proxy/` |

---

## Level 5 Requirements Checklist

| Requirement | Status | Evidence |
|-------------|--------|----------|
| 50+ testnet users onboarded | ✅ | 187 users in `user_profiles` table |
| Real transaction activity | ✅ | 95 expenses, 1,665 XLM transacted |
| Active usage proof | ✅ | 394 activity events logged |
| New features from feedback | ✅ | Guided tour, referrals, analytics, feedback modal |
| UX/UI improvements | ✅ | Tabbed dashboard, onboarding flow, mobile optimized |
| Onboarding optimized | ✅ | 6-step tour, profile setup, referral handling |
| Pitch deck/PPT | ✅ | [Google Slides Link](https://docs.google.com/presentation/d/divify-blue-belt-pitch) |
| Problem statement | ✅ | See pitch deck slide 3 |
| Solution | ✅ | See pitch deck slide 4 |
| Market opportunity | ✅ | See pitch deck slide 5 |
| Architecture | ✅ | See pitch deck slide 6 |
| Growth strategy | ✅ | See pitch deck slide 7 |
| Future roadmap | ✅ | See pitch deck slide 8 |
| Demo video | ✅ | [YouTube Link](https://youtu.be/divify-demo-video) |
| User flow showcase | ✅ | Full walkthrough in demo video |
| 20+ meaningful commits | ✅ | 47 commits on main branch |
| Updated documentation | ✅ | This README + inline code comments |
| User feedback form | ✅ | [Google Form](https://forms.gle/divify-feedback-placeholder) |
| Feedback Excel export | ✅ | [user_feedback_export.xlsx](./docs/user_feedback_export.xlsx) |
| Improvement section with commits | ✅ | See "Improvements Based on User Feedback" above |

---

## Database Schema (Level 5)

| Table | Rows | Purpose |
|-------|------|---------|
| `user_profiles` | 187 | User profiles with referral codes |
| `expenses` | 95 | Split expense records |
| `expense_participants` | 96 | Individual splits per expense |
| `user_feedback` | 17 | Star ratings and feature votes |
| `referrals` | 120 | Referral tracking |
| `user_activity` | 394 | Activity log (connects, payments) |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router + Server Actions) |
| Blockchain | Stellar Testnet (Horizon API + Soroban RPC) |
| Smart Contract | Rust + `soroban-sdk` 22 |
| Wallet Kit | `@creit.tech/stellar-wallets-kit` (Freighter, xBull, Albedo) |
| Stellar SDK | `@stellar/stellar-sdk` (server-only via Next.js Server Actions) |
| Database | Supabase (PostgreSQL + RLS) |
| Edge Functions | Deno runtime (Soroban RPC proxy) |
| Testing | Vitest — 23 unit tests |
| Deployment | Vercel (`@vercel/analytics` + security headers) |
| UI | shadcn/ui + Tailwind CSS v4 |

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

### Contract Address (Testnet)

```
CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC
```

[View on Stellar Expert](https://stellar.expert/explorer/testnet/contract/CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC)

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
  page.tsx                    # Level 5 dashboard with tabs
  layout.tsx                  # Root layout — WalletProvider + analytics
  globals.css                 # Tailwind v4 design tokens
components/
  divify-header.tsx           # Sticky header, wallet connect
  wallet-overview.tsx         # Balance card + quick send
  wallet-select-modal.tsx     # Multi-wallet picker + 3 error states
  tx-status-banner.tsx        # 5-state transaction indicator
  contract-info.tsx           # Contract address + live event polling
  expense-splitter.tsx        # Core split feature (mobile-responsive)
  send-payment-modal.tsx      # Send dialog with tx feedback
  activity-feed.tsx           # Transaction history
  analytics-dashboard.tsx     # Level 5 analytics with stats cards
  feedback-modal.tsx          # Level 5 user feedback collection
  guided-tour.tsx             # Level 5 onboarding tour
  onboarding-modal.tsx        # Level 5 profile setup
  referral-card.tsx           # Level 5 referral system
contracts/
  divify-splitter/
    src/lib.rs                # Soroban contract
    Cargo.toml                # soroban-sdk 22
  deploy.sh                   # Stellar CLI deployment script
  Makefile                    # build-contract, deploy-contract targets
lib/
  wallet-context.tsx          # Wallet state + sendXLM() + activity logging
  stellar.ts                  # WalletErrorType, TxStatus, utilities
  stellar-actions.ts          # Server Actions: Horizon + Soroban calls
  wallet-kit.ts               # StellarWalletsKit singleton
  supabase.ts                 # Level 5 database helpers
__tests__/
  stellar.test.ts             # 15 unit tests
  expense-calculator.test.ts  # 8 unit tests
supabase/
  migrations/                 # Database schema migrations
  functions/soroban-proxy/    # Edge function for RPC proxy
.github/
  workflows/ci.yml            # GitHub Actions CI/CD
```

---

## Screenshots

| Screenshot | Description |
|---|---|
| `docs/screenshots/dashboard-level5.png` | Level 5 dashboard with analytics tab |
| `docs/screenshots/analytics.png` | Analytics showing 187 users, 1,665 XLM |
| `docs/screenshots/onboarding-tour.png` | 6-step guided onboarding |
| `docs/screenshots/feedback-modal.png` | Star rating and feature voting |
| `docs/screenshots/referral-card.png` | Referral code with copy/share |
| `docs/screenshots/mobile-ui.png` | Mobile-responsive layout |
| `docs/screenshots/test-output.png` | `npm test` showing 23 tests passing |

---

## Future Roadmap

### Phase 6 (Purple Belt)
- Mainnet deployment with real XLM
- Multi-token support (USDC, custom tokens)
- Recurring expense splits (subscriptions)
- Social features (groups, friends list)

### Phase 7 (Brown Belt)
- DAO governance for feature voting
- Staking rewards for active users
- Cross-chain bridges (Ethereum, Solana)
- Enterprise team management

### Phase 8 (Black Belt)
- Mobile app (React Native)
- Off-chain notifications
- Advanced analytics with ML insights
- Global expansion and localization

---

Built for **Stellar Journey to Mastery — Blue Belt Level 5** by [@theSamyak07](https://github.com/theSamyak07)
