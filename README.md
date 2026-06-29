# Divify — Multi-Currency Expense Splitter on Stellar

> **Stellar Journey to Mastery — Belt Submission**

[![CI](https://github.com/theSamyak07/divify/actions/workflows/ci.yml/badge.svg)](https://github.com/theSamyak07/divify/actions/workflows/ci.yml)
[![Vercel](https://img.shields.io/badge/deployed-Vercel-black?logo=vercel)](https://divify.vercel.app)

Divify is a **non-custodial expense splitting dApp** built on the **Stellar Testnet** using **Soroban smart contracts** and **Next.js**. It enables users to split expenses, connect multiple Stellar wallets, and settle payments directly on the blockchain.

This project was built as part of the **Stellar Journey to Mastery Belt Submission**, demonstrating smart contract development, frontend integration, wallet connectivity, automated testing, and production deployment.

---

# Live Demo

* **Testnet Deployment:** https://divify.vercel.app
* **Repository:** https://github.com/theSamyak07/divify

> 🌐 The application is deployed on **Vercel** and connects to the **Stellar Testnet**

---

# Features

* Multi-wallet support

  * Freighter
  * xBull
  * Albedo

* Soroban smart contract

  * Create shared expenses
  * Split payments
  * Persistent contract storage
  * Event emission

* Stellar Testnet integration

* Responsive mobile-first UI

* GitHub Actions CI

* Production deployment on Vercel

---

# Tech Stack

## Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS

## Blockchain

* Stellar Testnet
* Soroban
* stellar-sdk
* stellar-wallets-kit

## Smart Contract

* Rust
* soroban-sdk

---

# Smart Contract

**Contract Address**

```
CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC
```

Main contract methods:

* create_expense()
* split_and_pay()
* get_expense()
* get_expense_count()

The contract stores expenses using Soroban persistent storage and emits events after successful transactions.

---

# Repository Structure

```
app/
components/
contracts/
  divify-splitter/
lib/
__tests__/
.github/workflows/
```

Important files:

```
contracts/divify-splitter/src/lib.rs
lib/stellar-actions.ts
lib/wallet-context.tsx
components/wallet-select-modal.tsx
.github/workflows/ci.yml
```

---

# Getting Started

Clone the repository

```bash
git clone https://github.com/theSamyak07/divify.git

cd divify
```

Install dependencies

```bash
npm install
```

Run development server

```bash
npm run dev
```

Run tests

```bash
npm test
```

Type checking

```bash
npx tsc --noEmit
```

---

# Smart Contract Development

Build

```bash
cd contracts/divify-splitter

make build-contract
```

Run tests

```bash
make test-contract
```

Deploy

```bash
make deploy-contract ACCOUNT=<YOUR_STELLAR_ACCOUNT>
```

---

# Wallet Support

The application supports:

* Freighter
* xBull
* Albedo

Users can connect their wallet, approve transactions, and submit payments directly to the Soroban contract.

---

# Testing

Frontend tests are written using **Vitest**.

Run:

```bash
npm test
```

The Soroban contract includes unit tests using:

```
soroban-sdk/testutils
```

---

# CI/CD

GitHub Actions automatically runs:

* Dependency installation
* Type checking
* Unit tests
* Build validation

Deployment is handled through Vercel.

---

# Submission Evidence

## Contract Address

```
CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC
```

## Example Transaction

```
0b2e57e521d10f0bba2a5c545ea9eef2c26abfb7719b36f5ff416fb34be410b4
```

## Checklist

* ✅ Wallet connection
* ✅ Soroban smart contract
* ✅ Frontend integration
* ✅ Responsive UI
* ✅ Automated testing
* ✅ GitHub Actions CI
* ✅ Vercel deployment

---

# Future Improvements

* Native Soroban RPC event indexing
* Group management
* Multi-currency settlement
* Notification support
* Expense history filtering

---

# License

MIT License
