/**
 * receipt-generator.ts — Settlement receipt & expense certificate generator
 *
 * Generates downloadable expense receipts for settled Divify splits.
 * Addresses user feedback: "Exportable settlement receipts make accounting easy."
 */

export interface ExpenseParticipant {
  address: string;
  amount: string; // XLM amount
  paid: boolean;
}

export interface SettlementReceipt {
  receiptId: string;
  expenseId: string | number;
  description: string;
  payer: string;
  totalAmountXLM: string;
  participants: ExpenseParticipant[];
  settledAt: string;
  txHash?: string;
  contractAddress: string;
  network: string;
}

/**
 * Generate a unique receipt ID for an expense settlement.
 */
export function generateReceiptId(expenseId: string | number): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `DIV-${String(expenseId).padStart(4, "0")}-${ts}-${rand}`;
}

/**
 * Build a SettlementReceipt object from expense data.
 */
export function buildReceipt(params: {
  expenseId: string | number;
  description: string;
  payer: string;
  totalAmountXLM: string;
  participants: ExpenseParticipant[];
  txHash?: string;
  contractAddress?: string;
}): SettlementReceipt {
  return {
    receiptId: generateReceiptId(params.expenseId),
    expenseId: params.expenseId,
    description: params.description,
    payer: params.payer,
    totalAmountXLM: params.totalAmountXLM,
    participants: params.participants,
    settledAt: new Date().toISOString(),
    txHash: params.txHash,
    contractAddress:
      params.contractAddress ??
      "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC",
    network: "Stellar Testnet",
  };
}

/**
 * Format a SettlementReceipt as a plain-text receipt string.
 * Suitable for copying to clipboard or downloading as a .txt file.
 */
export function formatReceiptAsText(receipt: SettlementReceipt): string {
  const divider = "─".repeat(52);
  const shortAddr = (addr: string) =>
    addr ? `${addr.slice(0, 8)}...${addr.slice(-6)}` : "—";

  const lines = [
    "DIVIFY — EXPENSE SETTLEMENT RECEIPT",
    divider,
    `Receipt ID  : ${receipt.receiptId}`,
    `Expense #   : ${receipt.expenseId}`,
    `Description : ${receipt.description}`,
    `Network     : ${receipt.network}`,
    `Settled At  : ${new Date(receipt.settledAt).toLocaleString()}`,
    divider,
    `Payer       : ${shortAddr(receipt.payer)}`,
    `Total       : ${receipt.totalAmountXLM} XLM`,
    divider,
    "PARTICIPANTS",
    ...receipt.participants.map(
      (p, i) =>
        `  ${i + 1}. ${shortAddr(p.address)}  ${p.amount} XLM  [${
          p.paid ? "✓ PAID" : "PENDING"
        }]`
    ),
    divider,
    receipt.txHash
      ? `TX Hash     : ${receipt.txHash}`
      : "TX Hash     : —",
    `Contract    : ${shortAddr(receipt.contractAddress)}`,
    divider,
    "Verified on Stellar Testnet · https://stellar.expert/explorer/testnet",
    "Powered by Divify — https://v0-divify.vercel.app",
  ];

  return lines.join("\n");
}

/**
 * Download a receipt as a plain-text file in the browser.
 */
export function downloadReceiptAsText(receipt: SettlementReceipt): void {
  if (typeof window === "undefined") return;
  const text = formatReceiptAsText(receipt);
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `divify-receipt-${receipt.receiptId}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Download a receipt as a JSON file for programmatic use.
 */
export function downloadReceiptAsJSON(receipt: SettlementReceipt): void {
  if (typeof window === "undefined") return;
  const json = JSON.stringify(receipt, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `divify-receipt-${receipt.receiptId}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
