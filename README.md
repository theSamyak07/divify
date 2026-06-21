# Divify — Multi-Currency Expense Splitter on Stellar

**Stellar Journey to Mastery — Orange Belt Submission (Level 3)**

[![CI](https://github.com/theSamyak07/divify/actions/workflows/ci.yml/badge.svg)](https://github.com/theSamyak07/divify/actions/workflows/ci.yml)

Divify is a production-ready, non-custodial expense splitting dApp built on the Stellar network. Split group bills in USD or XLM, pay participants directly via an on-chain Soroban smart contract, and stream live contract events in real-time — no bank, no middleman, no trust required.

---

## Live Demo

> Deploy to Vercel in one click:
>
> [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FtheSamyak07%2Fdivify)

**Live URL:** _(add your Vercel deployment URL here after deploying)_

---

## Features

### Level 1 (White Belt)
- **Wallet connect / disconnect** via Freighter (Firefox & Chrome)
- **Live XLM balance** fetched from Stellar Horizon Testnet
- **Send XLM transactions** with success/failure feedback and transaction hash
- **Expense splitter** — enter a total, add participants, split equally, and pay in one click
- **Transaction history** — recent operations live from Horizon with amounts and explorer links
- **Testnet faucet** — fund your wallet with Friendbot directly from the UI

### Level 2 (Yellow Belt)
- **Multi-wallet support** — Freighter, xBull, and Albedo via StellarWalletsKit
- **3 error types handled** — `WALLET_NOT_FOUND`, `WALLET_REJECTED`, `INSUFFICIENT_BALANCE`
- **Transaction status tracking** — persistent banner with 5 states (pending → signing → submitting → success / error)
- **Deployed contract** — Stellar Asset Contract (SAC) displayed with live event polling

### Level 3 (Orange Belt)
- **Custom Soroban smart contract** (`contracts/divify-splitter`) — expense records stored on-chain
- **Inter-contract communication** — `split_and_pay` invokes the token contract (SEP-41 interface) to transfer XLM to each participant atomically
- **Contract event streaming** — `expense_created` and `expense_paid` events emitted; frontend polls via Horizon in real time
- **GitHub Actions CI/CD** — automated lint, Vitest unit tests, Next.js production build, and Soroban WASM contract build on every push and PR
- **23 passing unit tests** — Vitest suite covering wallet error classification, XLM balance helpers, format utilities, address shortening, and split calculation logic
- **Mobile-first responsive design** — single-column layout on mobile, 3-column grid on desktop with `sm:` and `lg:` breakpoints throughout
- **Production-ready architecture** — server-only SDK calls via Next.js Server Actions, client/server code split, persistent wallet reconnection, TypeScript strict mode

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Server Actions) |
| Blockchain | Stellar Testnet (Horizon API + Soroban RPC) |
| Smart Contract | Rust + soroban-sdk 22 |
| Wallet Kit | `@creit.tech/stellar-wallets-kit` (Freighter, xBull, Albedo) |
| Stellar SDK | `@stellar/stellar-sdk` (server-only via Server Actions) |
| Testing | Vitest (23 unit tests) |
| CI/CD | GitHub Actions |
| UI | shadcn/ui + Tailwind CSS v4 |
| Deployment | Vercel (`@vercel/analytics` included) |

---

## Contract Details

### DivifySplitter — Soroban Contract

**Location:** `contracts/divify-splitter/src/lib.rs`

**Key functions:**

| Function | Description |
|---|---|
| `create_expense(payer, description, total_amount, token, participants)` | Stores an expense on-chain, emits `expense_created` event. Returns `expense_id`. |
| `split_and_pay(expense_id, payer, token, participants)` | **Inter-contract call** to token SAC to transfer `total/n` to each participant. Emits `expense_paid`. |
| `get_expense(id)` | Read a single expense record. |
| `get_expense_count()` | Total number of expenses ever created. |

**Inter-contract communication:** `split_and_pay` uses `soroban_sdk::token::Client` to invoke the Stellar Asset Contract for native XLM — this is a direct cross-contract call on the Soroban VM, not a plain Horizon operation.

**Deployed contract address:**
```
CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC
```
_(Stellar Asset Contract for native XLM — Testnet)_

> To deploy the custom `DivifySplitter` contract, see [contracts/deploy.sh](./contracts/deploy.sh).

---

## CI/CD Pipeline

GitHub Actions workflow at `.github/workflows/ci.yml` runs on every push and PR to `main`:

| Job | Steps |
|---|---|
| **Frontend** | `pnpm install` → `pnpm lint` → `pnpm test` (23 tests) → `pnpm build` |
| **Soroban Contract** | `cargo test --features testutils` → `cargo build --target wasm32-unknown-unknown --release` |

---

## Tests

**23 passing Vitest unit tests** across 2 test files:

```
__tests__/stellar.test.ts           — 15 tests
  classifyWalletError               (5 cases — all 3 error types + unknown + message preservation)
  getXLMBalance                     (3 cases — native present, absent, empty array)
  formatXLM                         (4 cases — string, number, zero, return type)
  shortenAddress                    (3 cases)

__tests__/expense-calculator.test.ts — 8 tests
  USD mode split                    (3 cases)
  XLM mode split                    (3 cases)
  Edge cases                        (2 cases — zero amount, zero participants)
```

Run locally:
```bash
pnpm test          # run once
pnpm test:watch    # watch mode
```

---

## Prerequisites

- Node.js 18+
- pnpm (or npm / yarn)
- Rust + `wasm32-unknown-unknown` target (for contract development only):
  ```bash
  rustup target add wasm32-unknown-unknown
  ```
- At least one Stellar wallet browser extension:
  - [Freighter](https://www.freighter.app/) — recommended (Firefox & Chrome)
  - [xBull](https://xbull.app/) — Chrome
  - [Albedo](https://albedo.link/) — no install required

---

## Setup & Run Locally

```bash
# 1. Clone the repository
git clone https://github.com/theSamyak07/divify.git
cd divify

# 2. Install dependencies
pnpm install

# 3. Run tests
pnpm test

# 4. Start the development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

No environment variables are required — the app connects directly to the public Stellar Testnet APIs.

---

## Deploy the Soroban Contract

```bash
# Requires Stellar CLI and a funded testnet account
chmod +x contracts/deploy.sh
./contracts/deploy.sh <YOUR_ACCOUNT_ALIAS>
```

See [contracts/deploy.sh](./contracts/deploy.sh) for full instructions.

---

## Project Structure

```
app/
  page.tsx                  # Landing + dashboard
  layout.tsx                # Root layout with WalletProvider
  globals.css               # Tailwind v4 theme tokens
components/
  divify-header.tsx         # Sticky header, multi-wallet connect
  wallet-overview.tsx       # Balance card + send + explorer links
  wallet-select-modal.tsx   # Multi-wallet picker with 3 error types (Level 2)
  tx-status-banner.tsx      # Persistent transaction status indicator (Level 2)
  contract-info.tsx         # Contract address + live event feed (Level 2/3)
  expense-splitter.tsx      # Core split feature
  send-payment-modal.tsx    # XLM send dialog with tx feedback
  activity-feed.tsx         # Recent transaction history
contracts/
  divify-splitter/
    src/lib.rs              # Soroban contract: create_expense, split_and_pay (Level 3)
    Cargo.toml              # soroban-sdk 22 dependency
  deploy.sh                 # Deployment script for Stellar CLI
lib/
  wallet-context.tsx        # Wallet state, sendXLM(), txStatus, walletError
  stellar.ts                # Constants, WalletErrorType, TxStatus, utility functions
  stellar-actions.ts        # Server Actions: Horizon queries, tx build/submit
  wallet-kit.ts             # StellarWalletsKit singleton
__tests__/
  stellar.test.ts           # 15 unit tests for stellar utilities
  expense-calculator.test.ts # 8 unit tests for split calculation logic
.github/
  workflows/ci.yml          # GitHub Actions CI/CD pipeline
```

---

## Level 3 Requirements Checklist

| Requirement | Implementation |
|---|---|
| Advanced smart contract | `contracts/divify-splitter/src/lib.rs` — `create_expense`, `split_and_pay`, `get_expense` |
| Inter-contract communication | `split_and_pay` uses `soroban_sdk::token::Client` to call the XLM token SAC |
| Event streaming & real-time updates | `expense_created` / `expense_paid` events; frontend polls Horizon every 15s |
| CI/CD pipeline | `.github/workflows/ci.yml` — lint, test (23 tests), build, Soroban WASM build |
| Smart contract deployment workflow | `contracts/deploy.sh` — automated deploy + invoke via Stellar CLI |
| Mobile responsive frontend | Single column → 3-col grid via `sm:` / `lg:` Tailwind breakpoints throughout |
| Error handling & loading states | `WalletErrorType` enum, `TxStatus` 5-state machine, skeleton loaders |
| Tests (3+ passing) | **23 passing Vitest unit tests** across 2 test files |
| Production-ready architecture | Server Actions, client/server split, TypeScript strict, Vercel analytics |
| Documentation | This README — complete setup, contract docs, CI/CD, test output |

---

## Screenshots

> _(Add screenshots of the following before submitting)_

- Mobile responsive UI (< 640px viewport)
- CI/CD pipeline passing in GitHub Actions
- `pnpm test` output showing 23 passing tests
- Contract info card with deployed address
- Wallet selection modal (Freighter / xBull / Albedo)
- Transaction status banner (signing → success)

---

## Submission Notes

- Network: **Stellar Testnet** (`Test SDF Network ; September 2015`)
- Horizon: `https://horizon-testnet.stellar.org`
- Soroban RPC: `https://soroban-testnet.stellar.org`
- Explorer: [stellar.expert/explorer/testnet](https://stellar.expert/explorer/testnet)
- Contract Address: `CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC`
- Wallets: Freighter · xBull · Albedo

---

Built for **Stellar Journey to Mastery — Orange Belt Level 3** by [@theSamyak07](https://github.com/theSamyak07)
