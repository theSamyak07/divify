# Divify — Multi-Currency Expense Splitter on Stellar

**Stellar Journey to Mastery — Orange Belt Submission (Level 3)**

[![CI](https://github.com/theSamyak07/divify/actions/workflows/ci.yml/badge.svg)](https://github.com/theSamyak07/divify/actions/workflows/ci.yml)
[![Tests](https://img.shields.io/badge/tests-23%20passing-brightgreen)](https://github.com/theSamyak07/divify/actions)
[![Vercel](https://img.shields.io/badge/deployed-Vercel-black?logo=vercel)](https://divify.vercel.app)

Divify is a production-ready, non-custodial expense splitting dApp built on the Stellar network. Split group bills in USD or XLM, pay participants directly via a deployed Soroban smart contract, and stream live contract events — no bank, no middleman, no trust required.

---

## 🌐 Live Demo

**→ [https://divify.vercel.app](https://divify.vercel.app)**

> Connect Freighter, xBull, or Albedo wallet (Testnet) — fund with Friendbot — split expenses and send XLM on-chain.

---

## 📋 Level 3 Submission Details

| Item | Detail |
|---|---|
| **Network** | Stellar Testnet (`Test SDF Network ; September 2015`) |
| **Contract Address** | `CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC` |
| **Contract Type** | Stellar Asset Contract (SAC) — native XLM |
| **Contract Explorer** | [View on Stellar Expert](https://stellar.expert/explorer/testnet/contract/CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC) |
| **Transaction Hash** | `0b2e57e521d10f0bba2a5c545ea9eef2c26abfb7719b36f5ff416fb34be410b4` |
| **Tx Explorer** | [View on Stellar Expert](https://stellar.expert/explorer/testnet/tx/0b2e57e521d10f0bba2a5c545ea9eef2c26abfb7719b36f5ff416fb34be410b4) |
| **Horizon** | `https://horizon-testnet.stellar.org` |
| **Soroban RPC** | `https://soroban-testnet.stellar.org` |
| **CI/CD** | GitHub Actions — [View Runs](https://github.com/theSamyak07/divify/actions) |
| **Tests** | 23 Vitest unit tests — all passing |

---

## ✅ Level 3 Requirements Checklist

| Requirement | Status | Implementation |
|---|---|---|
| Advanced smart contract | ✅ | `contracts/divify-splitter/src/lib.rs` — `create_expense`, `split_and_pay`, `get_expense` |
| Inter-contract communication | ✅ | `split_and_pay` calls `soroban_sdk::token::Client` (SEP-41) to invoke XLM token SAC |
| Event streaming & real-time updates | ✅ | `expense_created` / `expense_paid` events; frontend polls Horizon every 15s |
| CI/CD pipeline | ✅ | `.github/workflows/ci.yml` — lint, 23 tests, Next.js build, Soroban WASM build |
| Smart contract deployment workflow | ✅ | `contracts/deploy.sh` — automated deploy + invoke via Stellar CLI |
| Mobile responsive frontend | ✅ | Single-column → 3-col grid via `sm:` / `lg:` Tailwind breakpoints throughout |
| Error handling & loading states | ✅ | 3 `WalletErrorType` variants, `TxStatus` 5-state machine, skeleton loaders |
| Tests (3+ passing) | ✅ | **23 passing Vitest unit tests** across 2 test files |
| Production-ready architecture | ✅ | Server Actions, client/server split, TypeScript, Vercel, security headers |
| Documentation & demo | ✅ | This README + live demo at divify.vercel.app |

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

### Level 3 (Orange Belt)
- **Custom Soroban contract** — `create_expense` + `split_and_pay` with on-chain storage and events
- **Inter-contract communication** — direct cross-contract token transfer via `soroban_sdk::token::Client`
- **GitHub Actions CI/CD** — automated lint, test (23 tests), Next.js build, Soroban WASM build
- **23 passing unit tests** — Vitest suite covering all utility functions and split logic
- **Production deployment** — Vercel with security headers, immutable asset caching, Node 20 pinned
- **Mobile-first responsive** — works on all screen sizes from 320px up

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router + Server Actions) |
| Blockchain | Stellar Testnet (Horizon API + Soroban RPC) |
| Smart Contract | Rust + `soroban-sdk` 22 |
| Wallet Kit | `@creit.tech/stellar-wallets-kit` (Freighter, xBull, Albedo) |
| Stellar SDK | `@stellar/stellar-sdk` (server-only via Next.js Server Actions) |
| Testing | Vitest — 23 unit tests |
| CI/CD | GitHub Actions |
| Deployment | Vercel (`@vercel/analytics` + security headers) |
| UI | shadcn/ui + Tailwind CSS v4 |

---

## Smart Contract — DivifySplitter

**Location:** `contracts/divify-splitter/src/lib.rs`

### Functions

| Function | Description |
|---|---|
| `create_expense(payer, description, total_amount, token, participants)` | Creates expense record on-chain. Requires payer auth. Emits `expense_created` event. Returns `expense_id`. |
| `split_and_pay(expense_id, payer, token, participants)` | **Inter-contract call** — invokes token SAC to transfer `total ÷ n` tokens to each participant atomically. Emits `expense_paid` event. |
| `get_expense(id)` | Read an expense record by ID. |
| `get_expense_count()` | Total expenses ever created. |

### Inter-Contract Communication

`split_and_pay` demonstrates Soroban inter-contract calls:

```rust
// This is a direct cross-contract call to the Stellar Asset Contract (SAC)
let token_client = TokenClient::new(&env, &token);
for participant in participants.iter() {
    token_client.transfer(&payer, &participant, &per_person);
}
```

`TokenClient` wraps the standard SEP-41 token interface — calling it invokes the token contract on the Soroban VM, not a plain Horizon operation.

### Deploy Your Own Contract

```bash
# 1. Install Stellar CLI
# 2. Run:
chmod +x contracts/deploy.sh
./contracts/deploy.sh <YOUR_ACCOUNT_ALIAS>
```

See [`contracts/deploy.sh`](./contracts/deploy.sh) for full instructions.

---

## CI/CD Pipeline

`.github/workflows/ci.yml` — runs on every push and PR to `main`:

| Job | Steps | 
|---|---|
| **Frontend** | Install → Lint → **23 unit tests** → Production build |
| **Soroban Contract** | `cargo test --features testutils` → `cargo build --target wasm32-unknown-unknown` |

---

## Tests — 23 Passing

```
pnpm test
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
- pnpm (or npm / yarn)
- Stellar wallet browser extension:
  - [Freighter](https://www.freighter.app/) — recommended
  - [xBull](https://xbull.app/)
  - [Albedo](https://albedo.link/) — no install needed
- Rust + `wasm32-unknown-unknown` (for contract development only):
  ```bash
  rustup target add wasm32-unknown-unknown
  ```

---

## Setup & Run Locally

```bash
git clone https://github.com/theSamyak07/divify.git
cd divify
pnpm install
pnpm test        # verify 23 tests pass
pnpm dev         # http://localhost:3000
```

No environment variables required — connects to the public Stellar Testnet APIs.

---

## Project Structure

```
app/
  page.tsx                    # Landing + responsive dashboard
  layout.tsx                  # Root layout — WalletProvider + Novus analytics
  globals.css                 # Tailwind v4 design tokens
components/
  divify-header.tsx           # Sticky header, wallet connect
  wallet-overview.tsx         # Balance card + quick send
  wallet-select-modal.tsx     # Multi-wallet picker + 3 error states  [L2]
  tx-status-banner.tsx        # 5-state transaction indicator          [L2]
  contract-info.tsx           # Contract address + live event polling  [L2/3]
  expense-splitter.tsx        # Core split feature (mobile-responsive) [L1]
  send-payment-modal.tsx      # Send dialog with tx feedback           [L1]
  activity-feed.tsx           # Transaction history                    [L1]
contracts/
  divify-splitter/
    src/lib.rs                # Soroban contract: create_expense, split_and_pay  [L3]
    Cargo.toml                # soroban-sdk 22, wasm32 profile
  deploy.sh                   # Stellar CLI deployment script          [L3]
lib/
  wallet-context.tsx          # Wallet state + sendXLM() + txStatus
  stellar.ts                  # WalletErrorType, TxStatus, utilities
  stellar-actions.ts          # Server Actions: Horizon + Soroban calls
  wallet-kit.ts               # StellarWalletsKit singleton
__tests__/
  stellar.test.ts             # 15 unit tests                          [L3]
  expense-calculator.test.ts  # 8 unit tests                           [L3]
.github/
  workflows/ci.yml            # GitHub Actions CI/CD                   [L3]
```

---

## Screenshots

> Add screenshots before final submission

| Screenshot | Description |
|---|---|
| `screenshots/mobile-ui.png` | App on 375px viewport — single column, full-width buttons |
| `screenshots/ci-passing.png` | GitHub Actions run showing both jobs green |
| `screenshots/test-output.png` | `pnpm test` showing 23 tests passing |
| `screenshots/wallet-options.png` | Multi-wallet modal (Freighter / xBull / Albedo) |
| `screenshots/contract-info.png` | Contract card with SAC address + live events |
| `screenshots/tx-success.png` | Transaction confirmed with hash + explorer link |

---

Built for **Stellar Journey to Mastery — Orange Belt Level 3** by [@theSamyak07](https://github.com/theSamyak07)
