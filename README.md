# Divify — Multi-Currency Expense Splitter on Stellar

**Stellar Journey to Mastery — White Belt Submission**

Divify is a non-custodial expense splitting dApp built on the Stellar network. Split group bills (trips, dinners, shared subscriptions) in USD or XLM, then send each person's share directly as an XLM payment on Stellar Testnet — no bank, no middleman, no trust required.

---

## Features

- **Wallet connect / disconnect** via [Freighter](https://www.freighter.app/) (Firefox & Chrome)
- **Live XLM balance** fetched from Stellar Horizon Testnet
- **Send XLM transactions** with success/failure feedback and transaction hash
- **Expense splitter** — enter a total, add participants with Stellar addresses, split equally, and send each share in one click
- **Transaction history** — recent operations pulled live from Horizon with amounts and explorer links
- **Testnet faucet** — fund your wallet with Friendbot directly from the UI

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Blockchain | Stellar Testnet (Horizon API) |
| Wallet | Freighter via `@stellar/freighter-api` |
| Stellar SDK | `@stellar/stellar-sdk` |
| UI | shadcn/ui + Tailwind CSS v4 |
| Fonts | Space Grotesk + Geist Mono |

---

## Prerequisites

- Node.js 18+
- pnpm (or npm / yarn)
- [Freighter wallet extension](https://www.freighter.app/) installed in your browser (Firefox or Chrome)
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

1. **Install Freighter** — Download the browser extension from [freighter.app](https://www.freighter.app/). Create a wallet and switch the network to **Testnet** inside Freighter settings.
2. **Connect** — Click "Connect Freighter Wallet" on the landing page or the header button. Freighter will prompt you to authorize the app.
3. **Fund your wallet** — If your balance is 0, click the "Fund with Testnet XLM" button (uses Stellar Friendbot) to receive free testnet XLM.
4. **Send XLM** — Click "Quick Send" or "Send XLM" and fill in a recipient Stellar address plus an amount.
5. **Split an expense** — Under "Expense Splitter", enter an expense name, total amount (USD or XLM), add participant names and their Stellar addresses, then click "Calculate Split". Hit "Send" next to any row to pay that person.
6. **View history** — The "Recent Transactions" card shows your last 8 operations with amounts and explorer links.

---

## Project Structure

```
app/
  page.tsx          # Landing + dashboard (hero, wallet gate)
  layout.tsx        # Root layout with WalletProvider
  globals.css       # Tailwind v4 theme tokens
components/
  divify-header.tsx     # Sticky header with wallet connect/disconnect
  wallet-overview.tsx   # Balance card with send + explorer links
  expense-splitter.tsx  # Core split feature
  send-payment-modal.tsx # XLM send dialog with tx feedback
  activity-feed.tsx     # Recent transaction history
lib/
  wallet-context.tsx  # Freighter wallet state + sendXLM()
  stellar.ts          # Horizon server, balance helpers, tx types
```

---

## Screenshots

> Screenshots below show the key states required by the White Belt checklist.

### Wallet Connected State & Balance Displayed
![Wallet connected with XLM balance visible](./screenshots/wallet-connected.png)

### Successful Testnet Transaction
![Transaction success screen with hash](./screenshots/tx-success.png)

### Transaction Result Shown to User
![Transaction hash with explorer link](./screenshots/tx-result.png)

### Expense Splitter in Action
![Split results with per-person XLM amounts](./screenshots/expense-splitter.png)

---

## Submission Notes

- Network: **Stellar Testnet** (`Test SDF Network ; September 2015`)
- Horizon: `https://horizon-testnet.stellar.org`
- Explorer: [stellar.expert/explorer/testnet](https://stellar.expert/explorer/testnet)
- Wallet: Freighter (Firefox & Chrome, tested on both)

---

Built for **Stellar Journey to Mastery — White Belt Level 1** by [@theSamyak07](https://github.com/theSamyak07)
