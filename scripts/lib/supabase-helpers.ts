import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";

function loadEnv() {
  try {
    const envPath = resolve(process.cwd(), ".env");
    const envContent = readFileSync(envPath, "utf8");
    for (const line of envContent.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      const value = trimmed.slice(eqIdx + 1).trim();
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    // .env not found — rely on existing process.env
  }
}

loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function insertUserProfile(
  walletAddress: string,
  name: string,
  email: string,
  referralCode: string,
  referredBy: string | null,
  joinedAt: Date
): Promise<boolean> {
  const { error } = await supabase.from("user_profiles").upsert(
    {
      wallet_address: walletAddress,
      name,
      email,
      onboarded: true,
      referral_code: referralCode,
      referred_by: referredBy,
      joined_at: joinedAt.toISOString(),
      last_active: joinedAt.toISOString(),
    },
    { onConflict: "wallet_address" }
  );
  if (error) {
    console.error("  Profile insert error:", error.message);
    return false;
  }
  return true;
}

export async function insertReferral(
  referrerAddress: string,
  referredAddress: string,
  referralCode: string,
  createdAt: Date
): Promise<boolean> {
  const { error } = await supabase.from("referrals").insert({
    referrer_address: referrerAddress,
    referred_address: referredAddress,
    referral_code: referralCode,
    status: "completed",
    completed_at: createdAt.toISOString(),
    created_at: createdAt.toISOString(),
  });
  if (error && !error.message.includes("duplicate")) {
    console.error("  Referral insert error:", error.message);
    return false;
  }
  return true;
}

export async function insertActivity(
  walletAddress: string,
  actionType: string,
  actionDetail: string | null,
  txHash: string | null,
  amountXlm: number | null,
  createdAt: Date
): Promise<boolean> {
  const { error } = await supabase.from("user_activity").insert({
    wallet_address: walletAddress,
    action_type: actionType,
    action_detail: actionDetail,
    tx_hash: txHash,
    amount_xlm: amountXlm,
    created_at: createdAt.toISOString(),
  });
  if (error) {
    console.error("  Activity insert error:", error.message);
    return false;
  }
  return true;
}

export async function insertExpense(
  payerAddress: string,
  description: string,
  totalAmountXlm: number,
  currency: string,
  participantCount: number,
  txHash: string,
  status: string,
  createdAt: Date
): Promise<string | null> {
  const { data, error } = await supabase
    .from("expenses")
    .insert({
      payer_address: payerAddress,
      description,
      total_amount_xlm: totalAmountXlm,
      currency,
      participant_count: participantCount,
      tx_hash: txHash,
      status,
      created_at: createdAt.toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error("  Expense insert error:", error.message);
    return null;
  }
  return data?.id ?? null;
}

export async function insertExpenseParticipant(
  expenseId: string,
  name: string,
  stellarAddress: string,
  amountXlm: number,
  paid: boolean,
  txHash: string | null
): Promise<boolean> {
  const { error } = await supabase.from("expense_participants").insert({
    expense_id: expenseId,
    name,
    stellar_address: stellarAddress,
    amount_xlm: amountXlm,
    paid,
    tx_hash: txHash,
  });
  if (error) {
    console.error("  Participant insert error:", error.message);
    return false;
  }
  return true;
}

export async function insertFeedback(
  walletAddress: string,
  name: string,
  email: string,
  rating: number,
  easeOfUse: number,
  wouldRecommend: number,
  favoriteFeature: string,
  improvementSuggestion: string,
  experiencedBugs: string | null,
  createdAt: Date
): Promise<boolean> {
  const { error } = await supabase.from("user_feedback").insert({
    wallet_address: walletAddress,
    name,
    email,
    rating,
    ease_of_use: easeOfUse,
    would_recommend: wouldRecommend,
    favorite_feature: favoriteFeature,
    improvement_suggestion: improvementSuggestion,
    experienced_bugs: experiencedBugs,
    created_at: createdAt.toISOString(),
  });
  if (error) {
    console.error("  Feedback insert error:", error.message);
    return false;
  }
  return true;
}

export async function getExistingUserCount(): Promise<number> {
  const { count, error } = await supabase
    .from("user_profiles")
    .select("*", { count: "exact", head: true });
  if (error) return 0;
  return count ?? 0;
}
