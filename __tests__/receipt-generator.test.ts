import { describe, it, expect } from "vitest";
import {
  generateReceiptId,
  buildReceipt,
  formatReceiptAsText,
} from "@/lib/receipt-generator";

describe("receipt-generator", () => {
  const baseParams = {
    expenseId: 42,
    description: "Team lunch at Sarvana",
    payer: "GDQXKBZLHQMQZIJKRWHMZNYJJXSM6SGONVDQTDIQCFZMVXASKHZRZ5A",
    totalAmountXLM: "120.00",
    participants: [
      { address: "GBCD1234ABCD1234ABCD1234ABCD1234ABCD1234ABCD1234ABCD1234AB", amount: "40.00", paid: true },
      { address: "GCEF5678EFGH5678EFGH5678EFGH5678EFGH5678EFGH5678EFGH5678EF", amount: "40.00", paid: true },
      { address: "GDHJ9012IJKL9012IJKL9012IJKL9012IJKL9012IJKL9012IJKL9012IJ", amount: "40.00", paid: false },
    ],
    txHash: "abc123def456abc123def456abc123def456abc123def456abc123def456abc1",
  };

  describe("generateReceiptId", () => {
    it("generates a unique ID for each call", () => {
      const id1 = generateReceiptId(1);
      const id2 = generateReceiptId(1);
      expect(id1).not.toBe(id2);
    });

    it("starts with DIV- prefix", () => {
      expect(generateReceiptId(7).startsWith("DIV-")).toBe(true);
    });

    it("zero-pads the expense ID to 4 digits", () => {
      const id = generateReceiptId(5);
      expect(id).toContain("DIV-0005-");
    });
  });

  describe("buildReceipt", () => {
    it("builds a receipt with all required fields", () => {
      const receipt = buildReceipt(baseParams);
      expect(receipt.receiptId).toBeTruthy();
      expect(receipt.expenseId).toBe(42);
      expect(receipt.description).toBe("Team lunch at Sarvana");
      expect(receipt.totalAmountXLM).toBe("120.00");
      expect(receipt.participants).toHaveLength(3);
      expect(receipt.network).toBe("Stellar Testnet");
    });

    it("uses default contract address when not provided", () => {
      const receipt = buildReceipt(baseParams);
      expect(receipt.contractAddress).toContain("CDLZFC");
    });

    it("preserves custom contract address", () => {
      const receipt = buildReceipt({ ...baseParams, contractAddress: "CTEST1234" });
      expect(receipt.contractAddress).toBe("CTEST1234");
    });

    it("sets settledAt to a valid ISO date string", () => {
      const receipt = buildReceipt(baseParams);
      expect(() => new Date(receipt.settledAt)).not.toThrow();
    });
  });

  describe("formatReceiptAsText", () => {
    it("includes the receipt ID in the output", () => {
      const receipt = buildReceipt(baseParams);
      const text = formatReceiptAsText(receipt);
      expect(text).toContain(receipt.receiptId);
    });

    it("includes DIVIFY header", () => {
      const receipt = buildReceipt(baseParams);
      const text = formatReceiptAsText(receipt);
      expect(text).toContain("DIVIFY");
    });

    it("includes the description", () => {
      const receipt = buildReceipt(baseParams);
      const text = formatReceiptAsText(receipt);
      expect(text).toContain("Team lunch at Sarvana");
    });

    it("shows PAID status for settled participants", () => {
      const receipt = buildReceipt(baseParams);
      const text = formatReceiptAsText(receipt);
      expect(text).toContain("✓ PAID");
    });

    it("shows PENDING status for unsettled participants", () => {
      const receipt = buildReceipt(baseParams);
      const text = formatReceiptAsText(receipt);
      expect(text).toContain("PENDING");
    });
  });
});
