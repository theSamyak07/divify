# Google Form Guide: Divify User Feedback

This guide will walk you through creating a Google Form to collect user feedback for the Divify dApp, as required for the Blue Belt Level 5 submission.

## 1. Creating the Google Form

1. Go to [Google Forms](https://forms.google.com/).
2. Click on the **"+" (Blank)** button to create a new form.
3. Title the form: **"Divify Beta User Feedback"**.
4. Add a description: *"Thank you for testing Divify! Your feedback helps us improve the decentralized expense splitting experience on the Stellar network."*

## 2. Form Fields to Include

Add the following questions to your form. Make sure to set the appropriate question types!

*   **Stellar Testnet Wallet Address (Primary Identifier):**
    *   *Type:* Short answer
    *   *Description:* Starts with 'G' (e.g., GABC123...)
    *   *Required:* Yes
*   **Name (Optional):** 
    *   *Type:* Short answer
    *   *Required:* No
*   **Overall Rating:**
    *   *Type:* Linear scale (1 to 5)
    *   *Labels:* 1 = Poor, 5 = Excellent
    *   *Required:* Yes
*   **Ease of Use:**
    *   *Type:* Linear scale (1 to 5)
    *   *Labels:* 1 = Very difficult, 5 = Very easy
    *   *Required:* Yes
*   **Would you recommend Divify to a friend?**
    *   *Type:* Linear scale (1 to 5)
    *   *Labels:* 1 = Definitely not, 5 = Definitely yes
    *   *Required:* Yes
*   **Favorite Feature:**
    *   *Type:* Dropdown
    *   *Options:* Expense Splitter, Quick Send, Multi-Wallet Support, Contract Events, Analytics Dashboard, Mobile Experience, Other
    *   *Required:* Yes
*   **Improvement Suggestions:**
    *   *Type:* Paragraph
    *   *Required:* No
*   **Bug Reports:**
    *   *Type:* Paragraph
    *   *Description:* Please describe any issues you encountered and steps to reproduce them.
    *   *Required:* No

## 3. How to Export to Excel/CSV

Once you have collected responses:

1. Open your Google Form.
2. Click on the **"Responses"** tab at the top.
3. Click the green **"Link to Sheets"** icon (it looks like a green square with a white cross).
4. Choose "Create a new spreadsheet" and click **Create**.
5. The Google Sheet will open. To download it as a CSV:
    *   Go to **File** > **Download** > **Comma Separated Values (.csv)**.
6. Rename this file to `user_feedback_export.csv` and place it in the `docs` folder of your project.

## 4. How to Share the Form with Testnet Users

1. Open your Google Form.
2. Click the purple **"Send"** button in the top right corner.
3. Click the **Link icon** (it looks like a chain link).
4. Check the **"Shorten URL"** box for a cleaner link.
5. Click **"Copy"**.
6. Share this link on your project's GitHub README, Discord server, or social media to invite testnet users to provide feedback.

## Sample Google Form URL Format

A typical shortened Google Form URL will look like this:
`https://forms.gle/XXXXXXXXXXXXXXXXX`
