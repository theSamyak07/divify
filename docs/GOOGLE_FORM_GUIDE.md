# Platform User Feedback & Verification — Google Form Guide

This document describes how the **Platform User Feedback and Verification** Google Form was set up to collect user feedback and verify Stellar wallet interactions for the Divify platform.

## Live Form

**Link:** [https://forms.gle/kneRcE3eTa5oisiz5](https://forms.gle/kneRcE3eTa5oisiz5)

## Form Fields

The form collects the following information from each user:

| # | Field | Type | Required |
|---|---|---|---|
| 1 | Full Name | Short answer (text) | Yes |
| 2 | Email Address | Short answer (email validation) | Yes |
| 3 | Stellar Wallet Address (Public Key) | Short answer (starts with `G`, 56 characters) | Yes |
| 4 | Network | Multiple choice: Testnet / Public Mainnet | Yes |
| 5 | Rate the Platform (UI/UX & Lessons) | Linear scale 1–5 (Poor to Excellent) | Yes |
| 6 | What is one thing we could improve in the next phase? | Paragraph (long text) | No |

## Exporting Responses

1. Open the form at [https://forms.gle/kneRcE3eTa5oisiz5](https://forms.gle/kneRcE3eTa5oisiz5)
2. Click the **Responses** tab
3. Click the **Link to Sheets** icon to open responses in Google Sheets
4. In Google Sheets, go to `File` → `Download` → `Comma Separated Values (.csv)`
5. Save as [`docs/user_feedback_export.csv`](./user_feedback_export.csv)

## Exported Data

The exported CSV is available at [`docs/user_feedback_export.csv`](./user_feedback_export.csv) and contains 30 verified feedback entries.

The CSV columns match the Google Form field names exactly:
- `Timestamp`
- `Full Name`
- `Email Address`
- `Stellar Wallet Address (Public Key)`
- `Network`
- `Rate the Platform (UI/UX & Lessons)`
- `What is one thing we could improve in the next phase?`

## Verification

Each feedback submission includes a Stellar Wallet Address. These public keys can be cross-referenced with the on-chain transaction records in [`docs/user_wallets.csv`](./user_wallets.csv), which are verifiable on [Stellar Expert Explorer](https://stellar.expert/explorer/testnet/contract/CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC).
