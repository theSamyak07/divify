/**
 * Unit tests for the expense-split calculation logic.
 * These test the pure arithmetic used in ExpenseSplitter (components/expense-splitter.tsx).
 */
import { describe, it, expect } from "vitest";

// ---------------------------------------------------------------------------
// Pure split-calculation helper (mirrors the logic in ExpenseSplitter)
// ---------------------------------------------------------------------------

const XLM_PRICE_USD = 0.11; // approximate testnet sim price used in the component

interface SplitResult {
  perPersonOriginal: number;
  perPersonXLM: number;
}

function calculateEqualSplit(
  totalAmount: number,
  currency: "XLM" | "USD",
  participantCount: number
): SplitResult {
  if (participantCount <= 0) throw new Error("participantCount must be > 0");
  const perPerson = totalAmount / participantCount;
  const perPersonXLM =
    currency === "USD" ? perPerson / XLM_PRICE_USD : perPerson;
  return {
    perPersonOriginal: parseFloat(
      perPerson.toFixed(currency === "USD" ? 2 : 7)
    ),
    perPersonXLM: parseFloat(perPersonXLM.toFixed(7)),
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("calculateEqualSplit — USD mode", () => {
  it("splits $110 USD equally between 2 people ($55 each)", () => {
    const result = calculateEqualSplit(110, "USD", 2);
    expect(result.perPersonOriginal).toBe(55);
  });

  it("converts USD to XLM at the expected rate ($11 USD = 100 XLM)", () => {
    // $11 / $0.11 per XLM = 100 XLM
    const result = calculateEqualSplit(11, "USD", 1);
    expect(result.perPersonXLM).toBeCloseTo(100, 4);
  });

  it("handles 3 participants evenly", () => {
    const result = calculateEqualSplit(33, "USD", 3);
    expect(result.perPersonOriginal).toBe(11);
  });
});

describe("calculateEqualSplit — XLM mode", () => {
  it("splits 30 XLM equally between 3 people (10 XLM each)", () => {
    const result = calculateEqualSplit(30, "XLM", 3);
    expect(result.perPersonXLM).toBe(10);
  });

  it("single participant receives the full amount", () => {
    const result = calculateEqualSplit(50, "XLM", 1);
    expect(result.perPersonXLM).toBe(50);
  });

  it("preserves XLM precision up to 7 decimal places", () => {
    const result = calculateEqualSplit(0.0000001, "XLM", 1);
    expect(result.perPersonXLM).toBe(0.0000001);
  });
});

describe("calculateEqualSplit — edge cases", () => {
  it("throws when participantCount is zero", () => {
    expect(() => calculateEqualSplit(100, "XLM", 0)).toThrow();
  });

  it("returns 0 XLM when total amount is 0", () => {
    const result = calculateEqualSplit(0, "XLM", 3);
    expect(result.perPersonXLM).toBe(0);
  });
});
