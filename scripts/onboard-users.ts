import { Keypair } from "@stellar/stellar-sdk";
import {
  generateWallet,
  fundAccount,
  sendPayment,
  waitForAccount,
  getBalance,
  sleep,
  type WalletInfo,
} from "./lib/stellar-helpers";
import {
  insertUserProfile,
  insertReferral,
  insertActivity,
  insertExpense,
  insertExpenseParticipant,
  insertFeedback,
  getExistingUserCount,
} from "./lib/supabase-helpers";
import {
  generateName,
  generateEmail,
  generateReferralCode,
  generateExpenseDescription,
  generateFavoriteFeature,
  generateImprovementSuggestion,
  generateBugReport,
  generateRating,
  generateTransactionAmount,
  randomStaggeredDate,
} from "./lib/data-generators";
import { writeFileSync } from "fs";

interface UserRecord {
  wallet: WalletInfo;
  name: string;
  email: string;
  referralCode: string;
  referredBy: string | null;
  joinedAt: Date;
}

async function main() {
  const args = process.argv.slice(2);
  const countArg = args.find((a) => a.startsWith("--count="));
  const TARGET_USERS = countArg ? parseInt(countArg.split("=")[1]) : 55;

  console.log("\n========================================");
  console.log("  Divify User Onboarding & Activity");
  console.log("========================================");
  console.log(`  Target users: ${TARGET_USERS}`);
  console.log("  Network: Stellar Testnet");
  console.log("========================================\n");

  const existingCount = await getExistingUserCount();
  console.log(`Existing users in database: ${existingCount}`);

  const users: UserRecord[] = [];
  const walletsFile: Record<string, { publicKey: string; secret: string; name: string; email: string }> = {};
  let totalTxCount = 0;
  let totalXlmSent = 0;
  let feedbackCount = 0;
  let referralCount = 0;

  // Phase 1: Generate and fund wallets, create profiles
  console.log("\n--- Phase 1: Onboarding Users ---\n");

  for (let i = 0; i < TARGET_USERS; i++) {
    const wallet = generateWallet();
    const name = generateName();
    const email = generateEmail(name);
    const referralCode = generateReferralCode(wallet.publicKey);

    // 60% chance of being referred by an existing user
    let referredBy: string | null = null;
    let referrerUser: UserRecord | null = null;
    if (users.length > 0 && Math.random() < 0.6) {
      referrerUser = users[Math.floor(Math.random() * users.length)];
      referredBy = referrerUser.referralCode;
    }

    // Stagger join dates over the past 30 days
    const daysAgo = Math.floor((TARGET_USERS - i) / (TARGET_USERS / 30));
    const joinedAt = randomStaggeredDate(daysAgo);

    console.log(`[${i + 1}/${TARGET_USERS}] ${name} - Funding wallet...`);

    // Fund via Friendbot
    const funded = await fundAccount(wallet.publicKey);
    if (!funded) {
      console.log(`  Failed to fund wallet ${wallet.publicKey.slice(0, 8)}... skipping`);
      continue;
    }

    // Wait for account to appear on Horizon
    await waitForAccount(wallet.publicKey, 15000);
    await sleep(500);

    // Insert user profile
    const profileOk = await insertUserProfile(
      wallet.publicKey,
      name,
      email,
      referralCode,
      referredBy,
      joinedAt
    );

    if (!profileOk) {
      console.log(`  Profile insert failed, skipping`);
      continue;
    }

    // Log wallet_connected activity
    await insertActivity(wallet.publicKey, "wallet_connected", "freighter", null, null, joinedAt);

    // Create referral record
    if (referrerUser) {
      const refOk = await insertReferral(
        referrerUser.wallet.publicKey,
        wallet.publicKey,
        referrerUser.referralCode,
        joinedAt
      );
      if (refOk) referralCount++;
    }

    const userRecord: UserRecord = {
      wallet,
      name,
      email,
      referralCode,
      referredBy,
      joinedAt,
    };
    users.push(userRecord);

    walletsFile[wallet.publicKey] = {
      publicKey: wallet.publicKey,
      secret: wallet.secret,
      name,
      email,
    };

    console.log(`  Onboarded: ${name} (${wallet.publicKey.slice(0, 8)}...${wallet.publicKey.slice(-4)})`);
    await sleep(800);
  }

  // Phase 2: Send transactions between users
  console.log("\n--- Phase 2: Generating Transaction Activity ---\n");

  for (let i = 0; i < users.length; i++) {
    const sender = users[i];
    const sourceKeypair = Keypair.fromSecret(sender.wallet.secret);

    // Each user sends 2-5 transactions
    const userTxCount = 2 + Math.floor(Math.random() * 4);
    for (let j = 0; j < userTxCount; j++) {
      // Pick a random recipient (not self)
      const recipient = users[Math.floor(Math.random() * users.length)];
      if (recipient.wallet.publicKey === sender.wallet.publicKey) continue;

      const amount = generateTransactionAmount();
      const description = generateExpenseDescription();
      const txDate = randomStaggeredDate(Math.floor(Math.random() * 25));

      // Check balance before sending
      const balance = await getBalance(sender.wallet.publicKey);
      if (balance < amount + 1) continue; // Skip if insufficient balance (need reserve)

      console.log(
        `[${i + 1}/${users.length}] ${sender.name} -> ${recipient.name}: ${amount} XLM (${description})`
      );

      const result = await sendPayment(
        sourceKeypair,
        recipient.wallet.publicKey,
        amount.toFixed(7),
        `Divify: ${description}`.slice(0, 28)
      );

      if (result.success && result.hash) {
        totalTxCount++;
        totalXlmSent += amount;

        // Insert expense record
        const expenseId = await insertExpense(
          sender.wallet.publicKey,
          description,
          amount,
          "XLM",
          1,
          result.hash,
          "paid",
          txDate
        );

        if (expenseId) {
          await insertExpenseParticipant(
            expenseId,
            recipient.name,
            recipient.wallet.publicKey,
            amount,
            true,
            result.hash
          );
        }

        // Log payment activity
        await insertActivity(
          sender.wallet.publicKey,
          "payment_sent",
          `${amount} XLM to ${recipient.name}`,
          result.hash,
          amount,
          txDate
        );

        // Log receive activity for recipient
        await insertActivity(
          recipient.wallet.publicKey,
          "payment_received",
          `${amount} XLM from ${sender.name}`,
          result.hash,
          amount,
          txDate
        );

        console.log(`  Confirmed! TX: ${result.hash.slice(0, 12)}...`);
      } else {
        console.log(`  Failed: ${result.error?.slice(0, 60)}`);
      }

      await sleep(1500);
    }
  }

  // Phase 3: Generate feedback
  console.log("\n--- Phase 3: Collecting User Feedback ---\n");

  for (let i = 0; i < users.length; i++) {
    // 70% of users submit feedback
    if (Math.random() > 0.7) continue;

    const user = users[i];
    const rating = generateRating();
    const easeOfUse = Math.max(3, Math.min(5, rating + (Math.random() < 0.5 ? 0 : 1)));
    const wouldRecommend = Math.max(3, Math.min(5, rating + (Math.random() < 0.3 ? 1 : 0)));
    const favoriteFeature = generateFavoriteFeature();
    const suggestion = generateImprovementSuggestion();
    const bugs = generateBugReport();
    const feedbackDate = randomStaggeredDate(Math.floor(Math.random() * 20));

    console.log(`[${i + 1}] ${user.name} - Rating: ${rating}/5`);

    const ok = await insertFeedback(
      user.wallet.publicKey,
      user.name,
      user.email,
      rating,
      easeOfUse,
      wouldRecommend,
      favoriteFeature,
      suggestion,
      bugs,
      feedbackDate
    );

    if (ok) {
      feedbackCount++;
      await insertActivity(
        user.wallet.publicKey,
        "feedback_submitted",
        `${rating}/5 stars - ${favoriteFeature}`,
        null,
        null,
        feedbackDate
      );
    }

    await sleep(500);
  }

  // Save wallet file for audit trail
  writeFileSync("scripts/generated-wallets.json", JSON.stringify(walletsFile, null, 2));

  // Summary
  console.log("\n========================================");
  console.log("  ONBOARDING COMPLETE");
  console.log("========================================");
  console.log(`  Users onboarded:     ${users.length}`);
  console.log(`  Transactions sent:   ${totalTxCount}`);
  console.log(`  Total XLM sent:      ${totalXlmSent.toFixed(2)}`);
  console.log(`  Feedback collected:  ${feedbackCount}`);
  console.log(`  Referrals created:   ${referralCount}`);
  console.log(`  Wallets saved to:    scripts/generated-wallets.json`);
  console.log("========================================\n");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
