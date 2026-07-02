import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface UserProfileRow {
  wallet_address: string;
  name: string;
  email: string;
  onboarded: boolean;
  referral_code: string;
  referred_by: string | null;
  joined_at: string;
  last_active: string;
}

export interface UserFeedbackRow {
  id: string;
  wallet_address: string;
  name: string;
  email: string;
  rating: number;
  ease_of_use: number;
  would_recommend: number;
  favorite_feature: string | null;
  improvement_suggestion: string | null;
  experienced_bugs: string | null;
  created_at: string;
}

export interface ReferralRow {
  id: string;
  referrer_address: string;
  referred_address: string;
  referral_code: string;
  status: string;
  completed_at: string | null;
  created_at: string;
}

export interface UserActivityRow {
  id: string;
  wallet_address: string;
  action_type: string;
  action_detail: string | null;
  tx_hash: string | null;
  amount_xlm: number | null;
  created_at: string;
}

export interface ExpenseRow {
  id: string;
  payer_address: string;
  description: string;
  total_amount_xlm: number;
  currency: string;
  total_amount_usd?: number | null;
  participant_count: number;
  contract_expense_id?: number | null;
  tx_hash?: string | null;
  status: string;
  created_at: string;
}

export interface ExpenseParticipantRow {
  id: string;
  expense_id: string;
  name: string;
  stellar_address?: string | null;
  amount_xlm: number;
  paid: boolean;
  tx_hash?: string | null;
  created_at: string;
}

export async function saveExpense(
  expense: Omit<ExpenseRow, "id" | "created_at">
): Promise<{ data: ExpenseRow | null; error: string | null }> {
  const { data, error } = await supabase
    .from("expenses")
    .insert(expense)
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }
  return { data, error: null };
}

export async function saveExpenseParticipants(
  participants: Omit<ExpenseParticipantRow, "id" | "created_at">[]
): Promise<{ data: ExpenseParticipantRow[] | null; error: string | null }> {
  const { data, error } = await supabase
    .from("expense_participants")
    .insert(participants)
    .select();

  if (error) {
    return { data: null, error: error.message };
  }
  return { data, error: null };
}

export async function fetchExpensesByPayer(
  payerAddress: string
): Promise<{ data: ExpenseRow[]; error: string | null }> {
  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .eq("payer_address", payerAddress)
    .order("created_at", { ascending: false });

  if (error) {
    return { data: [], error: error.message };
  }
  return { data: data ?? [], error: null };
}

export async function fetchExpenseParticipants(
  expenseId: string
): Promise<{ data: ExpenseParticipantRow[]; error: string | null }> {
  const { data, error } = await supabase
    .from("expense_participants")
    .select("*")
    .eq("expense_id", expenseId);

  if (error) {
    return { data: [], error: error.message };
  }
  return { data: data ?? [], error: null };
}

export async function updateExpenseStatus(
  expenseId: string,
  status: string,
  txHash?: string
): Promise<{ success: boolean; error: string | null }> {
  const update: Record<string, unknown> = { status };
  if (txHash) update.tx_hash = txHash;

  const { error } = await supabase
    .from("expenses")
    .update(update)
    .eq("id", expenseId);

  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true, error: null };
}

export async function updateParticipantPaid(
  participantId: string,
  paid: boolean,
  txHash?: string
): Promise<{ success: boolean; error: string | null }> {
  const update: Record<string, unknown> = { paid };
  if (txHash) update.tx_hash = txHash;

  const { error } = await supabase
    .from("expense_participants")
    .update(update)
    .eq("id", participantId);

  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true, error: null };
}

export async function upsertUserProfile(
  walletAddress: string,
  name: string,
  email: string,
  referralCode: string,
  referredBy?: string | null
): Promise<{ success: boolean; error: string | null }> {
  const { error } = await supabase.from("user_profiles").upsert(
    {
      wallet_address: walletAddress,
      name,
      email,
      onboarded: true,
      referral_code: referralCode,
      referred_by: referredBy ?? null,
      last_active: new Date().toISOString(),
    },
    { onConflict: "wallet_address" }
  );
  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true, error: null };
}

export async function fetchUserProfile(
  walletAddress: string
): Promise<{ data: UserProfileRow | null; error: string | null }> {
  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("wallet_address", walletAddress)
    .single();
  if (error) {
    return { data: null, error: error.message };
  }
  return { data, error: null };
}

export async function saveUserFeedback(
  walletAddress: string,
  name: string,
  email: string,
  rating: number,
  easeOfUse: number,
  wouldRecommend: number,
  favoriteFeature?: string,
  improvementSuggestion?: string,
  experiencedBugs?: string
): Promise<{ success: boolean; error: string | null }> {
  const { error } = await supabase.from("user_feedback").insert({
    wallet_address: walletAddress,
    name,
    email,
    rating,
    ease_of_use: easeOfUse,
    would_recommend: wouldRecommend,
    favorite_feature: favoriteFeature ?? null,
    improvement_suggestion: improvementSuggestion ?? null,
    experienced_bugs: experiencedBugs ?? null,
  });
  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true, error: null };
}

export async function fetchAllFeedback(): Promise<{
  data: UserFeedbackRow[];
  error: string | null;
}> {
  const { data, error } = await supabase
    .from("user_feedback")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    return { data: [], error: error.message };
  }
  return { data: data ?? [], error: null };
}

export async function createReferral(
  referrerAddress: string,
  referredAddress: string,
  referralCode: string
): Promise<{ success: boolean; error: string | null }> {
  const { error } = await supabase.from("referrals").insert({
    referrer_address: referrerAddress,
    referred_address: referredAddress,
    referral_code: referralCode,
    status: "completed",
    completed_at: new Date().toISOString(),
  });
  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true, error: null };
}

export async function fetchReferralsByReferrer(
  referrerAddress: string
): Promise<{ data: ReferralRow[]; error: string | null }> {
  const { data, error } = await supabase
    .from("referrals")
    .select("*")
    .eq("referrer_address", referrerAddress)
    .order("created_at", { ascending: false });
  if (error) {
    return { data: [], error: error.message };
  }
  return { data: data ?? [], error: null };
}

export async function logUserActivity(
  walletAddress: string,
  actionType: string,
  actionDetail?: string | null,
  txHash?: string | null,
  amountXlm?: number | null
): Promise<{ success: boolean; error: string | null }> {
  const { error } = await supabase.from("user_activity").insert({
    wallet_address: walletAddress,
    action_type: actionType,
    action_detail: actionDetail ?? null,
    tx_hash: txHash ?? null,
    amount_xlm: amountXlm ?? null,
  });
  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true, error: null };
}

export async function fetchUserActivity(
  walletAddress: string
): Promise<{ data: UserActivityRow[]; error: string | null }> {
  const { data, error } = await supabase
    .from("user_activity")
    .select("*")
    .eq("wallet_address", walletAddress)
    .order("created_at", { ascending: false })
    .limit(20);
  if (error) {
    return { data: [], error: error.message };
  }
  return { data: data ?? [], error: null };
}
