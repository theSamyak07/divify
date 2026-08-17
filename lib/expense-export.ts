/**
 * expense-export.ts — Export expense history to CSV/JSON
 *
 * Allows users to download their complete local expense history
 * for record-keeping, tax purposes, or external analysis.
 * Addresses user feedback #18 Tanvi: "Exportable settlement receipts"
 * and #16 Sneha: "CSV export is useful for group accounting"
 */

export interface ExportableExpense {
  id: string | number;
  description: string;
  payer: string;
  totalAmountXLM: string;
  participants: number;
  status: "paid" | "pending" | "cancelled";
  createdAt: string;
  txHash?: string;
}

/**
 * Convert an array of expenses to a CSV string.
 */
export function expensesToCSV(expenses: ExportableExpense[]): string {
  const header =
    "id,description,payer,total_xlm,participants,status,created_at,tx_hash\n";

  const rows = expenses
    .map((e) =>
      [
        `"${e.id}"`,
        `"${e.description.replace(/"/g, '""')}"`,
        `"${e.payer}"`,
        `"${e.totalAmountXLM}"`,
        `"${e.participants}"`,
        `"${e.status}"`,
        `"${e.createdAt}"`,
        `"${e.txHash ?? ""}"`,
      ].join(",")
    )
    .join("\n");

  return header + rows;
}

/**
 * Download expense history as a CSV file in the browser.
 */
export function downloadExpensesCSV(
  expenses: ExportableExpense[],
  filename?: string
): void {
  if (typeof window === "undefined" || expenses.length === 0) return;

  const csv = expensesToCSV(expenses);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download =
    filename ?? `divify-expenses-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Download expense history as a JSON file.
 */
export function downloadExpensesJSON(
  expenses: ExportableExpense[],
  filename?: string
): void {
  if (typeof window === "undefined" || expenses.length === 0) return;

  const json = JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      network: "Stellar Testnet",
      contract: "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC",
      totalExpenses: expenses.length,
      expenses,
    },
    null,
    2
  );

  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download =
    filename ??
    `divify-expenses-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Generate a summary stats object from an expense array.
 */
export function getExpenseSummary(expenses: ExportableExpense[]): {
  total: number;
  paid: number;
  pending: number;
  cancelled: number;
  totalXLM: number;
  averageXLM: number;
} {
  const paid = expenses.filter((e) => e.status === "paid").length;
  const pending = expenses.filter((e) => e.status === "pending").length;
  const cancelled = expenses.filter((e) => e.status === "cancelled").length;
  const totalXLM = expenses.reduce(
    (sum, e) => sum + parseFloat(e.totalAmountXLM || "0"),
    0
  );

  return {
    total: expenses.length,
    paid,
    pending,
    cancelled,
    totalXLM: Math.round(totalXLM * 10000) / 10000,
    averageXLM:
      expenses.length > 0
        ? Math.round((totalXLM / expenses.length) * 10000) / 10000
        : 0,
  };
}
