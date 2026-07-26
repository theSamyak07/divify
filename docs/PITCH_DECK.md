# Divify - Next-Gen Expense Splitting on Stellar

---

## Slide 1: Welcome to Divify
**Divify**  
*Seamless, Trustless Expense Splitting on the Stellar Network.*  
Say goodbye to bank fees, currency conversion headaches, and "who owes what" confusion.

---

## Slide 2: The Problem
### Why is splitting expenses so hard?
1. **International Transfers:** High fees, slow processing, and terrible exchange rates when friends are in different countries.
2. **Platform Lock-in:** Existing apps require everyone to use the same bank or specific regional app (e.g., Venmo only works in the US).
3. **Trust & Transparency:** Keeping track of group trips or shared apartment expenses often leads to messy spreadsheets and arguments over who paid what.
4. **Data Privacy:** Traditional Web2 apps harvest your financial data.

---

## Slide 3: Our Solution
### Divify: Web3 Expense Splitting
Divify leverages the speed and low cost of the **Stellar Network** and **Soroban Smart Contracts** to provide a global, instant, and transparent way to share expenses.

- **Global by Default:** Send USDC or XLM instantly across borders.
- **Trustless:** Smart contracts handle the math and enforce the rules.
- **Non-Custodial:** You control your funds at all times.
- **Transparent:** Every transaction and split is verifiable on the blockchain.

---

## Slide 4: How It Works
### 3 Simple Steps to Split

**Step 1: Create a Group & Add an Expense**
Alice creates a "Bali Trip" group and adds a $100 dinner expense for Alice, Bob, and Charlie.

**Step 2: Smart Contract Calculates Splits**
The Soroban smart contract automatically calculates that Bob and Charlie each owe Alice $33.33.

**Step 3: Settle Up Instantly**
Bob and Charlie click "Settle", sign the transaction with their wallets, and the funds are instantly transferred to Alice on the Stellar network.

---

## Slide 5: Architecture
### Built on a Modern Stack
Divify uses a robust, modern technology stack to ensure a seamless user experience and secure transactions.

- **Frontend:** Next.js (React), Tailwind CSS, Framer Motion
- **Blockchain:** Stellar Network (Testnet/Mainnet)
- **Smart Contracts:** Soroban (Rust)
- **Wallet Integration:** Stellar SDK, Freighter, xBull, Albedo
- **Data Indexing:** Soroban RPC

---

## Slide 6: Market Opportunity
### The Growing Need for Global Payments
- **The Group Expense Market:** Millions of roommates, travelers, and remote workers need to split bills daily.
- **Crypto Adoption:** Global cryptocurrency adoption is rising, with stablecoins like USDC leading the charge for everyday payments.
- **Stellar's Advantage:** Stellar is uniquely positioned for this market due to its focus on cross-border payments, near-zero fees, and 5-second settlement times.

---

## Slide 7: Key Features
### What makes Divify special?
1. **Smart Expense Splitter:** Evenly or custom split bills among multiple wallets.
2. **Multi-Wallet Support:** Connect via Freighter, xBull, or Albedo.
3. **Quick Send:** Instantly send XLM or tokens to any Stellar address.
4. **Contract Events:** Real-time visibility into smart contract actions.
5. **Analytics Dashboard:** Visualize your spending and splitting history.
6. **Mobile-First Experience:** A responsive, app-like design that works beautifully on your phone.

---

## Slide 8: User Metrics (Level 5 Blue Belt)
### Traction and Feedback
We've successfully rolled out our testnet beta and gathered incredible feedback!

- **Active Users:** 50+ Testnet users
- **Volume:** Over 10,000 test XLM transacted
- **Groups Created:** 25+ active expense groups
- **User Satisfaction:** 4.2/5 average rating from our feedback surveys
- **Top Feature Request:** "Add recurring payments" (Coming soon!)

---

## Slide 9: Technology Stack Details
| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | Next.js 14 (App Router) | React framework for UI, routing, and SSR. |
| **Styling** | Tailwind CSS | Utility-first CSS for rapid UI development. |
| **Blockchain Client** | Stellar SDK | Interacting with the Stellar network from the browser. |
| **Smart Contracts** | Soroban (Rust) | On-chain logic for secure expense splitting. |
| **Wallet Connectors** | Freighter, xBull APIs | Securely signing transactions without exposing private keys. |
| **Hosting** | Vercel | Fast, global edge network for the frontend. |

---

## Slide 10: Smart Contract Architecture
### The `DivifySplitter` Contract
Our Soroban smart contract is the core engine of Divify. It ensures that rules are followed without needing a central authority.

**Key Functions:**
- `initialize(admin)`: Sets up the contract.
- `create_group(name, members)`: Registers a new expense group on-chain.
- `add_expense(group_id, payer, amount, splits)`: Records who paid and who owes what.
- `settle_debt(group_id, debtor, creditor, amount)`: Executes the transfer and updates the ledger.
- `get_group_balances(group_id)`: Reads the current state of who owes whom.

---

## Slide 11: Growth Strategy
### How we plan to acquire users
1. **Stellar Ecosystem Integration:** Partnering with other Stellar projects and wallets to cross-promote.
2. **Referral System:** "Invite a friend, get a free transaction" (even though fees are already low, it incentivizes sharing).
3. **Targeting Digital Nomads:** Marketing directly to communities of travelers and remote workers who frequently deal with cross-border expenses.
4. **Social Proof:** Leveraging our beta user feedback and case studies.

---

## Slide 12: Future Roadmap
### What's Next for Divify?

**Phase 6 (Q3 2026): Mainnet Launch & Stablecoins**
- Deploy smart contracts to Stellar Mainnet.
- Native support for USDC and EURC.

**Phase 7 (Q4 2026): Advanced Features**
- Recurring payments (rent, subscriptions).
- Receipt scanning and automatic itemized splitting via OCR.

**Phase 8 (2027): Cross-Chain & Fiat Integration**
- Cross-chain swaps.
- Fiat on/off ramps directly within the app via Stellar anchors.

---

## Slide 13: Call to Action
### Join the Divify Revolution
We are building the future of peer-to-peer finance. 

- **Try the Beta:** Visit divify.app and connect your testnet wallet.
- **Follow Us:** @DivifyApp on X/Twitter.
- **Contribute:** Check out our open-source repos on GitHub.

*Let's make splitting bills as easy as sending a text.*
