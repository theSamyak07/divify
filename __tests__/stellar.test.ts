/**
 * Unit tests for lib/stellar.ts — pure utility functions.
 * Run with: pnpm test
 */
import { describe, it, expect } from "vitest";
import {
  classifyWalletError,
  WalletErrorType,
  getXLMBalance,
  formatXLM,
  shortenAddress,
  type StellarBalance,
} from "../lib/stellar";

// ---------------------------------------------------------------------------
// classifyWalletError
// ---------------------------------------------------------------------------

describe("classifyWalletError", () => {
  it('classifies "not found / not installed" errors as NOT_FOUND', () => {
    const cases = [
      "Wallet extension not found",
      "not installed",
      "extension is missing",
    ];
    for (const msg of cases) {
      expect(classifyWalletError(msg).type).toBe(WalletErrorType.NOT_FOUND);
    }
  });

  it('classifies "rejected / denied / cancelled" errors as REJECTED', () => {
    const cases = [
      "User denied connection request",
      "Transaction rejected by wallet",
      "User declined the request",
      "cancel",
    ];
    for (const msg of cases) {
      expect(classifyWalletError(msg).type).toBe(WalletErrorType.REJECTED);
    }
  });

  it('classifies "insufficient / balance / underfunded" errors as INSUFFICIENT_BALANCE', () => {
    const cases = [
      "Insufficient balance to complete transaction",
      "Account underfunded",
      "balance too low",
    ];
    for (const msg of cases) {
      expect(classifyWalletError(msg).type).toBe(
        WalletErrorType.INSUFFICIENT_BALANCE
      );
    }
  });

  it("classifies unrecognised errors as UNKNOWN", () => {
    const err = classifyWalletError("Some completely unexpected error xyz");
    expect(err.type).toBe(WalletErrorType.UNKNOWN);
  });

  it("preserves the original error message verbatim", () => {
    const raw = "Wallet extension not found in browser";
    const err = classifyWalletError(raw);
    expect(err.message).toBe(raw);
  });
});

// ---------------------------------------------------------------------------
// getXLMBalance
// ---------------------------------------------------------------------------

describe("getXLMBalance", () => {
  it("returns the native XLM balance when present", () => {
    const balances: StellarBalance[] = [
      { asset_type: "native", balance: "250.5000000" },
      { asset_type: "credit_alphanum4", asset_code: "USDC", balance: "100.00" },
    ];
    expect(getXLMBalance(balances)).toBe("250.5000000");
  });

  it('returns "0" when there is no native balance', () => {
    const balances: StellarBalance[] = [
      { asset_type: "credit_alphanum4", asset_code: "USDC", balance: "100.00" },
    ];
    expect(getXLMBalance(balances)).toBe("0");
  });

  it('returns "0" for an empty balances array', () => {
    expect(getXLMBalance([])).toBe("0");
  });
});

// ---------------------------------------------------------------------------
// formatXLM
// ---------------------------------------------------------------------------

describe("formatXLM", () => {
  it("formats a numeric string that contains a decimal", () => {
    const result = formatXLM("1234.5678900");
    expect(result).toContain("1,234");
  });

  it("formats a plain number", () => {
    const result = formatXLM(99.99);
    expect(result).toContain("99");
  });

  it("formats zero without throwing", () => {
    expect(() => formatXLM(0)).not.toThrow();
    expect(formatXLM(0)).toContain("0");
  });

  it("returns a string", () => {
    expect(typeof formatXLM(42)).toBe("string");
  });
});

// ---------------------------------------------------------------------------
// shortenAddress
// ---------------------------------------------------------------------------

describe("shortenAddress", () => {
  const ADDR = "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5";

  it("returns the first and last N chars separated by ellipsis", () => {
    // chars=4 → first 4 = "GBBD", last 4 = "FLA5"
    const result = shortenAddress(ADDR, 4);
    expect(result).toBe("GBBD...FLA5");
  });

  it("defaults to 6 chars each side and contains ellipsis", () => {
    // chars=6 → first 6 = "GBBD47", last 6 = "LFLA5" doesn't fit — "LLFLA5"
    const result = shortenAddress(ADDR);
    expect(result.startsWith("GBBD47")).toBe(true);
    expect(result).toContain("...");
    // Full result should be shorter than the original
    expect(result.length).toBeLessThan(ADDR.length);
  });

  it("returns empty string for an empty input", () => {
    expect(shortenAddress("")).toBe("");
  });
});
