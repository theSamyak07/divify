# Platform User Feedback & Verification — Google Form Setup Guide

This guide details how the **Platform User Feedback and Verification** Google Form is configured to collect and verify community feedback and Stellar wallet interaction records for the Divify dApp.

**Live Form Link:** [https://forms.gle/kneRcE3eTa5oisiz5](https://forms.gle/kneRcE3eTa5oisiz5)

---

## 📋 Google Form Structure

### Form Title
`Platform User Feedback and Verification`

### Form Description
`Thank you for participating. Please complete this form to verify your identity and share your experience with our platform.`

---

## 📝 Form Fields Specification

| # | Question Label | Question Type | Options / Config | Required |
|---|---|---|---|---|
| 1 | **Full Name** | Short answer | Text input | Yes |
| 2 | **Email Address** | Short answer | Email validation | Yes |
| 3 | **Stellar Wallet Address (Public Key)** | Short answer | Text input (starts with `G`, 56 chars) | Yes |
| 4 | **Network** | Multiple choice | • Public Mainnet<br>• Testnet | Yes |
| 5 | **Rate the Platform (UI/UX & Lessons)** | Linear scale (1 to 5) | 1 = Poor<br>5 = Excellent | Yes |
| 6 | **What is one thing we could improve in the next phase?** | Paragraph | Long text | No |

---

## 📊 Exporting & Verifying Submissions

1. Go to your Google Form at [https://forms.gle/kneRcE3eTa5oisiz5](https://forms.gle/kneRcE3eTa5oisiz5).
2. Click on the **Responses** tab at the top.
3. Click the **"Link to Sheets"** icon to open live responses in Google Sheets.
4. Go to `File` → `Download` → `Comma Separated Values (.csv)` to save the exported data.
5. Save the exported CSV file as [`docs/user_feedback_export.csv`](./user_feedback_export.csv).

---

## 🔗 Verification against On-Chain Activity

Every submission includes the user's **Stellar Wallet Address (Public Key)**. Evaluators can cross-reference the submitted public keys with the on-chain contract transactions documented in [`docs/user_wallets.csv`](./user_wallets.csv) and verifiable on [Stellar Expert Explorer](https://stellar.expert/explorer/testnet/contract/CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC).
