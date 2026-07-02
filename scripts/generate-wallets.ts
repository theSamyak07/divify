import { Keypair } from "@stellar/stellar-sdk";
import { writeFileSync, readFileSync, existsSync } from "fs";
import {
  generateWallet,
  fundAccount,
  waitForAccount,
  sleep,
  type WalletInfo,
} from "./lib/stellar-helpers";
import {
  insertUserProfile,
  insertReferral,
  insertActivity,
  getExistingUserCount,
} from "./lib/supabase-helpers";
import {
  generateName,
  generateEmail,
  generateReferralCode,
  randomStaggeredDate,
} from "./lib/data-generators";

interface WalletRecord {
  publicKey: string;
  secret: string;
  name: string;
  email: string;
}

async function main() {
  const args = process.argv.slice(2);
  const countArg = args.find((a) => a.startsWith("--count="));
  const TARGET = countArg ? parseInt(countArg.split("=")[1]) : 55;

  console.log(`\n  Target: ${TARGET} new wallets\n`);

  // Load existing wallets file
  let wallets: Record<string, WalletRecord> = {};
  if (existsSync("scripts/generated-wallets.json")) {
    wallets = JSON.parse(readFileSync("scripts/generated-wallets.json", "utf8"));
    console.log(`  Existing wallets in file: ${Object.keys(wallets).length}`);
  }

  const existing = await getExistingUserCount();
  console.log(`  Existing users in DB: ${existing}\n`);

  let created = 0;
  let referrals = 0;
  const walletList = Object.values(wallets);

  for (let i = 0; i < TARGET; i++) {
    const wallet = generateWallet();
    const name = generateName();
    const email = generateEmail(name);
    const referralCode = generateReferralCode(wallet.publicKey);

    let referredBy: string | null = null;
    let referrerWallet: WalletRecord | null = null;
    if (walletList.length > 0 && Math.random() < 0.6) {
      referrerWallet = walletList[Math.floor(Math.random() * walletList.length)];
      referredBy = generateReferralCode(referrerWallet.publicKey);
    }

    const daysAgo = Math.floor((TARGET - i) / (TARGET / 30));
    const joinedAt = randomStaggeredDate(daysAgo);

    console.log(`[${i + 1}/${TARGET}] ${name} - Funding...`);

    const funded = await fundAccount(wallet.publicKey);
    if (!funded) {
      console.log(`  Failed to fund, skipping`);
      continue;
    }

    await waitForAccount(wallet.publicKey, 15000);
    await sleep(400);

    const ok = await insertUserProfile(
      wallet.publicKey,
      name,
      email,
      referralCode,
      referredBy,
      joinedAt
    );

    if (!ok) {
      console.log(`  Profile insert failed, skipping`);
      continue;
    }

    await insertActivity(wallet.publicKey, "wallet_connected", "freighter", null, null, joinedAt);

    if (referrerWallet) {
      const refOk = await insertReferral(
        referrerWallet.publicKey,
        wallet.publicKey,
        generateReferralCode(referrerWallet.publicKey),
        joinedAt
      );
      if (refOk) referrals++;
    }

    wallets[wallet.publicKey] = {
      publicKey: wallet.publicKey,
      secret: wallet.secret,
      name,
      email,
    };
    walletList.push({ publicKey: wallet.publicKey, secret: wallet.secret, name, email });

    // Save after each successful onboarding
    writeFileSync("scripts/generated-wallets.json", JSON.stringify(wallets, null, 2));

    created++;
    console.log(`  OK: ${name} (${wallet.publicKey.slice(0, 8)}...${wallet.publicKey.slice(-4)})`);
    await sleep(600);
  }

  console.log(`\n  Created: ${created} users`);
  console.log(`  Referrals: ${referrals}`);
  console.log(`  Total wallets saved: ${Object.keys(wallets).length}`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
