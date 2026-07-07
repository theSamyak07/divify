import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const supabase = createClient(supabaseUrl, supabaseKey);

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

// Level 5: User profile and feedback types
export interface UserProfileRow {
  id: string;
  wallet_address: string;
  name: string;
  email: string;
  joined_at: string;
  last_active: string;
  onboarded: boolean;
  referral_code?: string | null;
  referred_by?: string | null;
}

export interface UserFeedbackRow {
  id: string;
  wallet_address: string;
  name: string;
  email: string;
  rating: number;
  ease_of_use: number;
  would_recommend: number;
  favorite_feature?: string | null;
  improvement_suggestion?: string | null;
  experienced_bugs?: string | null;
  created_at: string;
}

export interface ReferralRow {
  id: string;
  referrer_address: string;
  referred_address: string;
  referral_code: string;
  status: string;
  created_at: string;
  completed_at?: string | null;
}

export interface UserActivityRow {
  id: string;
  wallet_address: string;
  action_type: string;
  action_detail?: string | null;
  tx_hash?: string | null;
  amount_xlm?: number | null;
  created_at: string;
}

// Level 5: User profile functions
export async function getUserProfile(
  walletAddress: string
): Promise<{ data: UserProfileRow | null; error: string | null }> {
  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("wallet_address", walletAddress)
    .single();

  if (error && error.code !== "PGRST116") {
    return { data: null, error: error.message };
  }
  return { data: data ?? null, error: null };
}

export async function upsertUserProfile(
  profile: Omit<UserProfileRow, "id" | "joined_at" | "last_active" | "onboarded">
): Promise<{ data: UserProfileRow | null; error: string | null }> {
  const { data, error } = await supabase
    .from("user_profiles")
    .upsert(
      { ...profile, last_active: new Date().toISOString() },
      { onConflict: "wallet_address" }
    )
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }
  return { data, error: null };
}

export async function markUserOnboarded(
  walletAddress: string
): Promise<{ success: boolean; error: string | null }> {
  const { error } = await supabase
    .from("user_profiles")
    .update({ onboarded: true })
    .eq("wallet_address", walletAddress);

  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true, error: null };
}

// Level 5: Feedback functions
export async function saveUserFeedback(
  feedback: Omit<UserFeedbackRow, "id" | "created_at">
): Promise<{ data: UserFeedbackRow | null; error: string | null }> {
  const { data, error } = await supabase
    .from("user_feedback")
    .insert(feedback)
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }
  return { data, error: null };
}

export async function getUserFeedback(
  walletAddress: string
): Promise<{ data: UserFeedbackRow | null; error: string | null }> {
  const { data, error } = await supabase
    .from("user_feedback")
    .select("*")
    .eq("wallet_address", walletAddress)
    .single();

  if (error && error.code !== "PGRST116") {
    return { data: null, error: error.message };
  }
  return { data: data ?? null, error: null };
}

// Level 5: Referral functions
export async function generateReferralCode(
  walletAddress: string
): Promise<{ code: string; error: string | null }> {
  const code = walletAddress.slice(-6).toUpperCase();
  const { error } = await supabase
    .from("user_profiles")
    .update({ referral_code: code })
    .eq("wallet_address", walletAddress);

  if (error) {
    return { code: "", error: error.message };
  }
  return { code, error: null };
}

export async function saveReferral(
  referrerAddress: string,
  referredAddress: string,
  referralCode: string
): Promise<{ data: ReferralRow | null; error: string | null }> {
  const { data, error } = await supabase
    .from("referrals")
    .insert({
      referrer_address: referrerAddress,
      referred_address: referredAddress,
      referral_code: referralCode,
      status: "pending",
    })
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }
  return { data, error: null };
}

export async function getReferralsByUser(
  walletAddress: string
): Promise<{ data: ReferralRow[]; error: string | null }> {
  const { data, error } = await supabase
    .from("referrals")
    .select("*")
    .eq("referrer_address", walletAddress)
    .order("created_at", { ascending: false });

  if (error) {
    return { data: [], error: error.message };
  }
  return { data: data ?? [], error: null };
}

// Level 5: Activity logging
export async function logUserActivity(
  activity: Omit<UserActivityRow, "id" | "created_at">
): Promise<{ success: boolean; error: string | null }> {
  const { error } = await supabase.from("user_activity").insert(activity);

  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true, error: null };
}

// Level 5: Analytics stats
export interface AnalyticsStats {
  totalUsers: number;
  totalExpenses: number;
  totalXlm: number;
  feedbackCount: number;
  referralCount: number;
  activityCount: number;
}

export async function getAnalyticsStats(): Promise<{
  data: AnalyticsStats | null;
  error: string | null;
}> {
  const [users, expenses, feedback, referrals, activities] = await Promise.all([
    supabase.from("user_profiles").select("id", { count: "exact", head: true }),
    supabase.from("expenses").select("total_amount_xlm", { count: "exact" }),
    supabase.from("user_feedback").select("id", { count: "exact", head: true }),
    supabase.from("referrals").select("id", { count: "exact", head: true }),
    supabase.from("user_activity").select("id", { count: "exact", head: true }),
  ]);

  if (users.error || expenses.error || feedback.error || referrals.error) {
    return {
      data: null,
      error: users.error?.message || expenses.error?.message || "Unknown error",
    };
  }

  const totalXlm =
    expenses.data?.reduce(
      (sum, e) => sum + (Number(e.total_amount_xlm) || 0),
      0
    ) || 0;

  return {
    data: {
      totalUsers: users.count || 0,
      totalExpenses: expenses.count || 0,
      totalXlm,
      feedbackCount: feedback.count || 0,
      referralCount: referrals.count || 0,
      activityCount: activities.count || 0,
    },
    error: null,
  };
}
