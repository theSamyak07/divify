# Divify — Multi-Currency Expense Splitter on Stellar

**Stellar Journey to Mastery — Yellow Belt Submission (Level 2)**

Divify is a non-custodial expense splitting dApp built on the Stellar network. Split group bills (trips, dinners, shared subscriptions) in USD or XLM, then send each person's share directly as an XLM payment on Stellar Testnet — no bank, no middleman, no trust required.

Level 2 adds multi-wallet support via StellarWalletsKit, structured error handling for 3 wallet error types, a live transaction status banner, and real-time contract event polling.

---

## Features

### Level 1 (White Belt)
- **Wallet connect / disconnect** via Freighter (Firefox & Chrome)
- **Live XLM balance** fetched from Stellar Horizon Testnet
- **Send XLM transactions** with success/failure feedback and transaction hash
- **Expense splitter** — enter a total, add participants with Stellar addresses, split equally, and send each share in one click
- **Transaction history** — recent operations pulled live from Horizon with amounts and explorer links
- **Testnet faucet** — fund your wallet with Friendbot directly from the UI

### Level 2 (Yellow Belt)
- **Multi-wallet support** — Freighter, xBull, and Albedo via [StellarWalletsKit](https://github.com/Creit-Tech/Stellar-Wallets-Kit)
- **3 error types handled** — `WALLET_NOT_FOUND`, `WALLET_REJECTED`, and `INSUFFICIENT_BALANCE`, each with a distinct UI banner and recovery action
- **Transaction status tracking** — persistent banner shows `pending → signing → submitting → success / error` across all states
- **Deployed contract integration** — displays the Stellar Asset Contract (SAC) address for native XLM on testnet with a live event feed
- **Real-time event polling** — contract info card polls Horizon every 15 seconds and renders outbound payment events with explorer links

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Blockchain | Stellar Testnet (Horizon API + Soroban RPC) |
| Wallet Kit | `@creit.tech/stellar-wallets-kit` (Freighter, xBull, Albedo) |
| Stellar SDK | `@stellar/stellar-sdk` (server-only via Next.js Server Actions) |
| UI | shadcn/ui + Tailwind CSS v4 |
| Fonts | Space Grotesk + Geist Mono |

---

## Prerequisites

- Node.js 18+
- pnpm (or npm / yarn)
- At least one Stellar wallet browser extension:
  - [Freighter](https://www.freighter.app/) — recommended (Firefox & Chrome)
  - [xBull](https://xbull.app/) — Chrome
  - [Albedo](https://albedo.link/) — no install required (browser-based)
- A Stellar Testnet account (use the in-app faucet button to get free testnet XLM)

---

## Setup & Run Locally

```bash
# 1. Clone the repository
git clone https://github.com/theSamyak07/divify.git
cd divify

# 2. Install dependencies
pnpm install

# 3. Start the development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

No environment variables are required — the app connects directly to the public Stellar Testnet Horizon API.

---

## How to Use

1. **Choose a wallet** — Click "Connect Wallet" and pick from Freighter, xBull, or Albedo. Albedo requires no browser extension.
2. **Connect** — Approve the connection request in your chosen wallet. If the extension isn't installed, you'll see a "Wallet Not Found" error with an install link.
3. **Fund your wallet** — If your balance is 0, click "Fund with Testnet XLM" (uses Stellar Friendbot) to receive free testnet XLM.
4. **Send XLM** — Click "Quick Send" or "Send XLM", fill in a recipient Stellar address and amount. The status banner at the top tracks each stage in real time.
5. **Split an expense** — Under "Expense Splitter", enter an expense name, total amount (USD or XLM), add participant Stellar addresses, then click "Calculate Split". Hit "Send" next to any row to pay that person.
6. **View contract events** — The "Deployed Contract" card shows the SAC address and polls for your outbound payment events every 15 seconds with direct explorer links.
7. **View history** — The "Recent Transactions" card shows your last operations with amounts and explorer links.

---

## Project Structure

```
app/
  page.tsx                  # Landing + dashboard (hero, wallet gate)
  layout.tsx                # Root layout with WalletProvider
  globals.css               # Tailwind v4 theme tokens
components/
  divify-header.tsx         # Sticky header with wallet connect/disconnect
  wallet-overview.tsx       # Balance card with send + explorer links
  wallet-select-modal.tsx   # Level 2: Multi-wallet picker with error UI
  tx-status-banner.tsx      # Level 2: Persistent transaction status indicator
  contract-info.tsx         # Level 2: Deployed contract address + live event feed
  expense-splitter.tsx      # Core split feature
  send-payment-modal.tsx    # XLM send dialog with tx feedback
  activity-feed.tsx         # Recent transaction history
lib/
  wallet-context.tsx        # Wallet state, sendXLM(), txStatus, walletError
  stellar.ts                # Constants, WalletErrorType enum, TxStatus type, helpers
  stellar-actions.ts        # Server Actions: Horizon queries, tx build/submit, contract fetch
  wallet-kit.ts             # StellarWalletsKit singleton (Freighter + xBull + Albedo)
```

---

## Level 2 Requirements Checklist

| Requirement | Implementation |
|---|---|
| StellarWalletsKit implementation | `lib/wallet-kit.ts` — Freighter, xBull, Albedo modules |
| 3 error types handled | `WalletErrorType` enum in `lib/stellar.ts`; distinct UI in `wallet-select-modal.tsx` |
| Contract deployed on testnet | Stellar Asset Contract (SAC) for native XLM — `CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC` |
| Contract called from frontend | `getContractAddressAction()` + `fetchContractExpenseEventsAction()` in `lib/stellar-actions.ts` |
| Transaction status visible | `TxStatusBanner` component — 5 distinct states rendered at top of dashboard |
| 2+ meaningful commits | See git log |

---

## Screenshots

> Screenshots below show the key states required by the Level 2 checklist.

### Wallet Options Available
![Multi-wallet selection modal showing Freighter, xBull, and Albedo](./screenshots/wallet-options.png)

### Wallet Error — Not Found
![Wallet not found error with install link](./screenshots/error-not-found.png)

### Transaction Status Banner
![Transaction status showing signing/submitting/success states](./screenshots/tx-status.png)

### Deployed Contract Address
![Contract info card showing SAC address and live event feed](./screenshots/contract-info.png)

### Wallet Connected State & Balance Displayed
![Wallet connected with XLM balance visible](./screenshots/wallet-connected.png)

### Successful Testnet Transaction
![Transaction success screen with hash](./screenshots/tx-success.png)

---

## Submission Notes

- Network: **Stellar Testnet** (`Test SDF Network ; September 2015`)
- Horizon: `https://horizon-testnet.stellar.org`
- Soroban RPC: `https://soroban-testnet.stellar.org`
- Explorer: [stellar.expert/explorer/testnet](https://stellar.expert/explorer/testnet)
- Deployed Contract: `CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC` (Stellar Asset Contract — native XLM, Testnet)
- Wallets supported: Freighter, xBull, Albedo

---

Built for **Stellar Journey to Mastery — Yellow Belt Level 2** by [@theSamyak07](https://github.com/theSamyak07)
