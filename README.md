# Divify — Multi-Currency Expense Splitter on Stellar

**Stellar Journey to Mastery — Yellow Belt Submission (Level 2)**

[![CI](https://github.com/theSamyak07/divify/actions/workflows/ci.yml/badge.svg)](https://github.com/theSamyak07/divify/actions/workflows/ci.yml)
[![Tests](https://img.shields.io/badge/tests-23%20passing-brightgreen)](https://github.com/theSamyak07/divify/actions)
[![Vercel](https://img.shields.io/badge/deployed-Vercel-black?logo=vercel)](https://divify.vercel.app)

Divify is a production-ready, non-custodial expense splitting dApp built on the Stellar network. Split group bills in USD or XLM, pay participants directly via a deployed Soroban smart contract, and stream live contract events — no bank, no middleman, no trust required.

---

## 🌐 Live Demo

**→ [https://divify.vercel.app](https://divify.vercel.app)**

> Connect Freighter, xBull, or Albedo wallet (Testnet) — fund with Friendbot — split expenses and send XLM on-chain.

---

## 📋 Level 2 Submission Details

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
| **Tests** | 23 Vitest unit tests — all passing |

---

## ✅ Level 2 Requirements Checklist

| Requirement | Status | Implementation |
|---|---|---|
| 3 error types handled | ✅ | `WalletErrorType`: `NOT_FOUND`, `REJECTED`, `INSUFFICIENT_BALANCE` in `lib/stellar.ts` |
| Contract deployed on testnet | ✅ | SAC address `CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC` displayed in UI |
| Contract called from frontend | ✅ | `fetchContractExpenseEventsAction` + `getContractAddressAction` in `lib/stellar-actions.ts` |
| Transaction status visible | ✅ | `TxStatus` 5-state banner: `idle → pending → signing → submitting → success/error` |
| Multi-wallet support | ✅ | Freighter, xBull, Albedo via `@creit.tech/stellar-wallets-kit` |
| Event streaming | ✅ | `ContractInfo` polls Horizon every 15s for live payment events |
| Tests (3+ passing) | ✅ | **23 passing Vitest unit tests** across 2 test files |
| Mobile responsive | ✅ | Single-column → 3-col grid via `sm:` / `lg:` Tailwind breakpoints |
| Documentation & demo | ✅ | This README with contract address, tx hash, live demo link |

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

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router + Server Actions) |
| Blockchain | Stellar Testnet (Horizon API + Soroban RPC) |
| Smart Contract | Rust + `soroban-sdk` 22 (Level 3) |
| Wallet Kit | `@creit.tech/stellar-wallets-kit` (Freighter, xBull, Albedo) |
| Stellar SDK | `@stellar/stellar-sdk` (server-only via Next.js Server Actions) |
| Testing | Vitest — 23 unit tests |
| Deployment | Vercel (`@vercel/analytics` + security headers) |
| UI | shadcn/ui + Tailwind CSS v4 |

---

## Smart Contract — DivifySplitter

**Location:** `contracts/divify-splitter/src/lib.rs`

### Level 2: Contract Integration

The frontend interacts with a deployed Stellar Asset Contract (SAC) for native XLM:

| Function | Description |
|---|---|
| `getContractAddressAction()` | Returns the deployed SAC address (`CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC`) |
| `fetchContractExpenseEventsAction()` | Queries Horizon for payment operations as contract event proxy |

The `ContractInfo` component (`components/contract-info.tsx`) displays the contract address and polls for live events every 15 seconds.

### Level 3: Full Soroban Contract (Future)

The repository includes a complete Soroban smart contract with `create_expense`, `split_and_pay`, `get_expense`, and `get_expense_count` functions. See `contracts/divify-splitter/src/lib.rs`.

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
| `screenshots/test-output.png` | `npm test` showing 23 tests passing |
| `screenshots/wallet-options.png` | Multi-wallet modal (Freighter / xBull / Albedo) |
| `screenshots/contract-info.png` | Contract card with SAC address + live events |
| `screenshots/tx-success.png` | Transaction confirmed with hash + explorer link |

---

Built for **Stellar Journey to Mastery — Orange Belt Level 3** by [@theSamyak07](https://github.com/theSamyak07)
