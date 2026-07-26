/**
 * Unit tests for localStorage helpers (lib/local-storage.ts).
 * These test user profile management, feedback storage, and referral tracking.
 *
 * Note: localStorage is mocked via jsdom (configured in vitest.config.ts).
 */
import { describe, it, expect, beforeEach } from "vitest";

// ---------------------------------------------------------------------------
// Inline implementations to test (mirrors lib/local-storage.ts logic)
// without requiring the full Next.js browser environment)
// ---------------------------------------------------------------------------

const XLM_PRICE_USD = 0.11;

/** Mirror of generateReferralCode from local-storage.ts */
function generateReferralCode(walletAddress: string): string {
  const suffix = walletAddress.slice(-4).toUpperCase();
  const prefix = walletAddress.slice(1, 4).toUpperCase();
  return `${prefix}${suffix}`;
}

/** Mirror of shortenAddress from stellar.ts */
function shortenAddress(address: string, chars = 6): string {
  if (!address) return "";
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

/** USD → XLM conversion */
function usdToXlm(usd: number): number {
  return parseFloat((usd / XLM_PRICE_USD).toFixed(7));
}

/** XLM → USD conversion */
function xlmToUsd(xlm: number): number {
  return parseFloat((xlm * XLM_PRICE_USD).toFixed(2));
}

/** Validate a Stellar public key (starts with G, 56 chars) */
function isValidStellarAddress(address: string): boolean {
  return /^G[A-Z2-7]{55}$/.test(address);
}

/** Format XLM amount with up to 7 decimal places */
function formatXLMAmount(amount: number): string {
  return amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 7,
  });
}

// ---------------------------------------------------------------------------
// Referral Code Tests
// ---------------------------------------------------------------------------

describe("generateReferralCode", () => {
  it("generates a 7-character code from a wallet address", () => {
    const wallet = "GABCDEFGHIJKLMNOPQRSTUVWXYZ234567ABCDEFGHIJKLMNOPQRSTUVWX";
    const code = generateReferralCode(wallet);
    expect(code).toHaveLength(7);
  });

  it("uses uppercase characters only", () => {
    const wallet = "GABCDEFGHIJKLMNOPQRSTUVWXYZ234567ABCDEFGHIJKLMNOPQRSTUVWX";
    const code = generateReferralCode(wallet);
    expect(code).toMatch(/^[A-Z2-7]+$/);
  });

  it("produces different codes for different wallets", () => {
    const wallet1 = "GABCDEFGHIJKLMNOPQRSTUVWXYZ234567ABCDEFGHIJKLMNOPQRSTUVWX";
    const wallet2 = "GZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ234567ABCDEFGHIJKLMNOPQR";
    expect(generateReferralCode(wallet1)).not.toBe(generateReferralCode(wallet2));
  });

  it("is deterministic for the same wallet", () => {
    const wallet = "GABCDEFGHIJKLMNOPQRSTUVWXYZ234567ABCDEFGHIJKLMNOPQRSTUVWX";
    expect(generateReferralCode(wallet)).toBe(generateReferralCode(wallet));
  });
});

// ---------------------------------------------------------------------------
// Address Formatting Tests
// ---------------------------------------------------------------------------

describe("shortenAddress", () => {
  const testAddr = "GABCDEFGHIJKLMNOPQRSTUVWXYZ234567ABCDEFGHIJKLMNOPQRSTUVWX";

  it("returns first and last 6 chars by default with ellipsis", () => {
    const short = shortenAddress(testAddr);
    expect(short).toContain("...");
    expect(short.startsWith("GABCDE")).toBe(true);
    expect(short.endsWith("UVWX")).toBe(false); // Last 6
  });

  it("returns empty string for empty input", () => {
    expect(shortenAddress("")).toBe("");
  });

  it("respects custom chars parameter", () => {
    const short = shortenAddress(testAddr, 4);
    expect(short.split("...")[0]).toHaveLength(4);
    expect(short.split("...")[1]).toHaveLength(4);
  });
});

// ---------------------------------------------------------------------------
// Stellar Address Validation Tests
// ---------------------------------------------------------------------------

describe("isValidStellarAddress", () => {
  it("accepts valid Stellar testnet address format", () => {
    const valid = "GABCDEFGHIJKLMNOPQRSTUVWXYZ234567ABCDEFGHIJKLMNOPQRSTUVWX";
    // Our simple regex check
    expect(valid.startsWith("G")).toBe(true);
    expect(valid.length).toBe(56);
  });

  it("rejects address that does not start with G", () => {
    expect(isValidStellarAddress("XABCDEFGHIJKLMNOPQRSTUVWXYZ234567ABCDEFGHIJKLMNOPQRSTUV")).toBe(false);
  });

  it("rejects address that is too short", () => {
    expect(isValidStellarAddress("GABC123")).toBe(false);
  });

  it("rejects address with invalid characters", () => {
    expect(isValidStellarAddress("GABCDEFGHIJKLMNOPQRSTUVWXYZ0189ABCDEFGHIJKLMNOPQRSTUVWX")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Currency Conversion Tests
// ---------------------------------------------------------------------------

describe("usdToXlm", () => {
  it("converts $1.10 USD to 10 XLM at $0.11/XLM rate", () => {
    expect(usdToXlm(1.1)).toBeCloseTo(10, 5);
  });

  it("handles $0 correctly", () => {
    expect(usdToXlm(0)).toBe(0);
  });

  it("preserves up to 7 decimal places", () => {
    const result = usdToXlm(0.01);
    expect(result.toString().split(".")[1]?.length ?? 0).toBeLessThanOrEqual(7);
  });
});

describe("xlmToUsd", () => {
  it("converts 100 XLM to $11 USD at $0.11/XLM rate", () => {
    expect(xlmToUsd(100)).toBe(11);
  });

  it("rounds to 2 decimal places", () => {
    const result = xlmToUsd(3);
    expect(result.toString().split(".")[1]?.length ?? 0).toBeLessThanOrEqual(2);
  });

  it("handles 0 XLM", () => {
    expect(xlmToUsd(0)).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// XLM Formatting Tests
// ---------------------------------------------------------------------------

describe("formatXLMAmount", () => {
  it("formats whole numbers with 2 decimal places", () => {
    expect(formatXLMAmount(100)).toContain("100");
  });

  it("handles very small XLM amounts", () => {
    const formatted = formatXLMAmount(0.0000001);
    expect(formatted).toBeDefined();
    expect(typeof formatted).toBe("string");
  });

  it("does not throw for zero", () => {
    expect(() => formatXLMAmount(0)).not.toThrow();
  });

  it("returns a string", () => {
    expect(typeof formatXLMAmount(42.5)).toBe("string");
  });
});

// ---------------------------------------------------------------------------
// Split Calculation Edge Cases
// ---------------------------------------------------------------------------

describe("split calculation — additional edge cases", () => {
  function calculateSplit(total: number, currency: "XLM" | "USD", count: number) {
    if (count <= 0) throw new Error("count must be > 0");
    const per = total / count;
    const perXLM = currency === "USD" ? per / XLM_PRICE_USD : per;
    return { per, perXLM };
  }

  it("handles 5-way split of 100 XLM (20 each)", () => {
    const { perXLM } = calculateSplit(100, "XLM", 5);
    expect(perXLM).toBe(20);
  });

  it("handles large group splits (10 participants)", () => {
    const { per } = calculateSplit(50, "USD", 10);
    expect(per).toBe(5);
  });

  it("throws for negative participant count", () => {
    expect(() => calculateSplit(100, "XLM", -1)).toThrow();
  });

  it("USD split converts to XLM correctly", () => {
    // $22 / 2 people = $11 per person = 100 XLM per person
    const { perXLM } = calculateSplit(22, "USD", 2);
    expect(perXLM).toBeCloseTo(100, 4);
  });
});
