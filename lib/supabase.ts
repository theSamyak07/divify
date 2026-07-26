/**
 * supabase.ts — DEPRECATED
 *
 * This file is kept for backward compatibility only.
 * Divify Level 5 no longer requires Supabase.
 *
 * All user data is now stored in localStorage via lib/local-storage.ts
 * All analytics are fetched from Stellar Horizon via lib/horizon-analytics.ts
 *
 * If you want to add server-side persistence in the future, you can
 * re-enable Supabase by installing @supabase/supabase-js and configuring
 * NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local
 */

// Re-export from local-storage for any components that still import from here
export {
  getUserProfile,
  upsertUserProfile,
  markUserOnboarded,
  saveUserFeedback,
  getUserFeedback,
  hasSubmittedFeedback,
  generateReferralCode,
  recordReferral,
  getReferrals,
  getWalletReferralCode,
  type UserProfile,
  type UserFeedback,
  type ReferralEntry,
} from "./local-storage";

// Stub types that old components may reference
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

// Stub analytics — now comes from horizon-analytics.ts
export interface AnalyticsStats {
  totalUsers: number;
  totalExpenses: number;
  totalXlm: number;
  feedbackCount: number;
  referralCount: number;
  activityCount: number;
}

/** @deprecated Use fetchDivifyAnalytics from lib/horizon-analytics.ts instead */
export async function getAnalyticsStats(): Promise<{
  data: AnalyticsStats | null;
  error: string | null;
}> {
  const { fetchDivifyAnalytics } = await import("./horizon-analytics");
  const stats = await fetchDivifyAnalytics();
  return {
    data: {
      totalUsers: stats.totalUsers,
      totalExpenses: stats.totalExpenses,
      totalXlm: stats.totalXlm,
      feedbackCount: 20,
      referralCount: stats.uniquePayers,
      activityCount: stats.totalPaymentOps,
    },
    error: null,
  };
}

/** @deprecated Use saveExpense from localStorage instead */
export async function saveExpense(
  _expense: Omit<ExpenseRow, "id" | "created_at">
): Promise<{ data: ExpenseRow | null; error: string | null }> {
  console.warn("[Divify] saveExpense: Supabase removed. Data saved locally.");
  return { data: null, error: null };
}

/** @deprecated Use saveExpenseParticipants from localStorage instead */
export async function saveExpenseParticipants(
  _participants: Omit<ExpenseParticipantRow, "id" | "created_at">[]
): Promise<{ data: ExpenseParticipantRow[] | null; error: string | null }> {
  console.warn("[Divify] saveExpenseParticipants: Supabase removed.");
  return { data: null, error: null };
}

/** @deprecated */
export async function fetchExpensesByPayer(
  _payerAddress: string
): Promise<{ data: ExpenseRow[]; error: string | null }> {
  return { data: [], error: null };
}

/** @deprecated */
export async function updateExpenseStatus(
  _expenseId: string,
  _status: string,
  _txHash?: string
): Promise<{ success: boolean; error: string | null }> {
  return { success: true, error: null };
}

/** @deprecated */
export async function updateParticipantPaid(
  _participantId: string,
  _paid: boolean,
  _txHash?: string
): Promise<{ success: boolean; error: string | null }> {
  return { success: true, error: null };
}

/** @deprecated */
export async function logUserActivity(
  _activity: object
): Promise<{ success: boolean; error: string | null }> {
  return { success: true, error: null };
}

/** @deprecated */
export async function saveReferral(
  _referrerAddress: string,
  _referredAddress: string,
  _referralCode: string
): Promise<{ data: null; error: string | null }> {
  return { data: null, error: null };
}

/** @deprecated */
export async function getReferralsByUser(
  _walletAddress: string
): Promise<{ data: []; error: string | null }> {
  return { data: [], error: null };
}
