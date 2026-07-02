import { Keypair } from "@stellar/stellar-sdk";
import { readFileSync } from "fs";
import {
  sendPayment,
  getBalance,
  sleep,
} from "./lib/stellar-helpers";
import {
  insertActivity,
  insertExpense,
  insertExpenseParticipant,
  insertFeedback,
} from "./lib/supabase-helpers";
import {
  generateExpenseDescription,
  generateFavoriteFeature,
  generateImprovementSuggestion,
  generateBugReport,
  generateRating,
  generateTransactionAmount,
  randomStaggeredDate,
} from "./lib/data-generators";

interface WalletRecord {
  publicKey: string;
  secret: string;
  name: string;
  email: string;
}

async function main() {
  console.log("\n========================================");
  console.log("  Divify Transaction & Feedback Activity");
  console.log("========================================\n");

  // Load generated wallets
  let wallets: WalletRecord[];
  try {
    const data = readFileSync("scripts/generated-wallets.json", "utf8");
    wallets = Object.values(JSON.parse(data)) as WalletRecord[];
    console.log(`Loaded ${wallets.length} wallets from generated-wallets.json`);
  } catch {
    console.log("No generated-wallets.json found. Run onboard-users first.");
    return;
  }

  if (wallets.length < 2) {
    console.log("Need at least 2 wallets for transactions.");
    return;
  }

  let txCount = 0;
  let totalXlmSent = 0;
  let feedbackCount = 0;

  // Phase 1: Send transactions between wallets
  console.log("\n--- Phase 1: Sending Transactions ---\n");

  // Send a batch of transactions (limit to avoid timeout)
  const MAX_TX = 80;
  let attempted = 0;

  for (let i = 0; i < wallets.length && txCount < MAX_TX; i++) {
    const sender = wallets[i];
    const sourceKeypair = Keypair.fromSecret(sender.secret);

    // Send 1-2 transactions per wallet in this batch
    const userTxCount = 1 + Math.floor(Math.random() * 2);
    for (let j = 0; j < userTxCount && txCount < MAX_TX; j++) {
      const recipient = wallets[Math.floor(Math.random() * wallets.length)];
      if (recipient.publicKey === sender.publicKey) continue;

      const amount = generateTransactionAmount();
      const description = generateExpenseDescription();
      const txDate = randomStaggeredDate(Math.floor(Math.random() * 25));

      attempted++;
      console.log(`[${txCount + 1}/${MAX_TX}] ${sender.name} -> ${recipient.name}: ${amount} XLM`);

      const result = await sendPayment(
        sourceKeypair,
        recipient.publicKey,
        amount.toFixed(7),
        `Divify: ${description}`.slice(0, 28)
      );

      if (result.success && result.hash) {
        txCount++;
        totalXlmSent += amount;

        const expenseId = await insertExpense(
          sender.publicKey,
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
            recipient.publicKey,
            amount,
            true,
            result.hash
          );
        }

        await insertActivity(
          sender.publicKey,
          "payment_sent",
          `${amount} XLM to ${recipient.name}`,
          result.hash,
          amount,
          txDate
        );

        await insertActivity(
          recipient.publicKey,
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

      await sleep(2000);
    }
  }

  // Phase 2: Generate feedback
  console.log("\n--- Phase 2: Collecting Feedback ---\n");

  for (let i = 0; i < wallets.length; i++) {
    if (Math.random() > 0.65) continue;

    const user = wallets[i];
    const rating = generateRating();
    const easeOfUse = Math.max(3, Math.min(5, rating + (Math.random() < 0.5 ? 0 : 1)));
    const wouldRecommend = Math.max(3, Math.min(5, rating + (Math.random() < 0.3 ? 1 : 0)));
    const favoriteFeature = generateFavoriteFeature();
    const suggestion = generateImprovementSuggestion();
    const bugs = generateBugReport();
    const feedbackDate = randomStaggeredDate(Math.floor(Math.random() * 20));

    console.log(`[${i + 1}] ${user.name} - Rating: ${rating}/5`);

    const ok = await insertFeedback(
      user.publicKey,
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
        user.publicKey,
        "feedback_submitted",
        `${rating}/5 stars - ${favoriteFeature}`,
        null,
        null,
        feedbackDate
      );
    }

    await sleep(300);
  }

  console.log("\n========================================");
  console.log("  ACTIVITY GENERATION COMPLETE");
  console.log("========================================");
  console.log(`  Transactions sent:   ${txCount} (attempted: ${attempted})`);
  console.log(`  Total XLM sent:      ${totalXlmSent.toFixed(2)}`);
  console.log(`  Feedback collected:  ${feedbackCount}`);
  console.log("========================================\n");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
