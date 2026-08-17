import { describe, it, expect } from "vitest";
import {
  xlmToFiat,
  fiatToXlm,
  formatFiat,
  getSupportedCurrencies,
  type ExchangeRates,
} from "@/lib/currency-converter";

const mockRates: ExchangeRates = {
  XLM_USD: 0.11,
  XLM_EUR: 0.10,
  XLM_INR: 9.15,
  XLM_GBP: 0.086,
  XLM_AUD: 0.167,
  fetchedAt: new Date().toISOString(),
  source: "fallback",
};

describe("currency-converter", () => {
  describe("xlmToFiat", () => {
    it("converts XLM to USD correctly", () => {
      expect(xlmToFiat(100, "USD", mockRates)).toBeCloseTo(11, 2);
    });

    it("converts XLM to INR correctly", () => {
      expect(xlmToFiat(100, "INR", mockRates)).toBeCloseTo(915, 1);
    });

    it("converts XLM to EUR correctly", () => {
      expect(xlmToFiat(50, "EUR", mockRates)).toBeCloseTo(5, 2);
    });

    it("returns 0 for 0 XLM", () => {
      expect(xlmToFiat(0, "USD", mockRates)).toBe(0);
    });
  });

  describe("fiatToXlm", () => {
    it("converts USD to XLM correctly", () => {
      const xlm = fiatToXlm(11, "USD", mockRates);
      expect(xlm).toBeCloseTo(100, 1);
    });

    it("converts INR to XLM correctly", () => {
      const xlm = fiatToXlm(915, "INR", mockRates);
      expect(xlm).toBeCloseTo(100, 1);
    });

    it("returns 0 when rate is 0", () => {
      const zeroRates = { ...mockRates, XLM_USD: 0 };
      expect(fiatToXlm(100, "USD", zeroRates)).toBe(0);
    });
  });

  describe("formatFiat", () => {
    it("formats USD with $ symbol", () => {
      expect(formatFiat(11.5, "USD")).toBe("$11.50");
    });

    it("formats INR with ₹ symbol", () => {
      expect(formatFiat(915.0, "INR")).toBe("₹915.00");
    });

    it("formats EUR with € symbol", () => {
      expect(formatFiat(5.0, "EUR")).toBe("€5.00");
    });

    it("formats GBP with £ symbol", () => {
      expect(formatFiat(8.6, "GBP")).toBe("£8.60");
    });

    it("formats AUD with A$ symbol", () => {
      expect(formatFiat(16.7, "AUD")).toBe("A$16.70");
    });
  });

  describe("getSupportedCurrencies", () => {
    it("returns all 5 supported currencies", () => {
      const currencies = getSupportedCurrencies();
      expect(currencies).toHaveLength(5);
      expect(currencies).toContain("USD");
      expect(currencies).toContain("EUR");
      expect(currencies).toContain("INR");
      expect(currencies).toContain("GBP");
      expect(currencies).toContain("AUD");
    });
  });
});
