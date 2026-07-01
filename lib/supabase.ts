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
