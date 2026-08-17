import { describe, it, expect } from "vitest";
import {
  isValidStellarPublicKey,
  isValidContractAddress,
  getStellarKeyError,
  formatStellarAddress,
  isSameAccount,
} from "@/lib/stellar-validator";

describe("stellar-validator", () => {
  describe("isValidStellarPublicKey", () => {
    it("returns true for a well-formed 56-char G... key", () => {
      const key = "GDQXKBZLHQMQZIJKRWHMZNYJJXSM6SGONVDQTDIQCFZMVXASKHZRZ5A";
      expect(isValidStellarPublicKey(key)).toBe(true);
    });

    it("returns false for a key starting with C (contract address)", () => {
      expect(isValidStellarPublicKey("CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC")).toBe(false);
    });

    it("returns false for an empty string", () => {
      expect(isValidStellarPublicKey("")).toBe(false);
    });

    it("returns false for a short key", () => {
      expect(isValidStellarPublicKey("GABCD1234")).toBe(false);
    });

    it("returns false if key contains lowercase letters", () => {
      const badKey = "g" + "A".repeat(55);
      expect(isValidStellarPublicKey(badKey)).toBe(false);
    });

    it("returns false for null/undefined input", () => {
      expect(isValidStellarPublicKey(null as unknown as string)).toBe(false);
      expect(isValidStellarPublicKey(undefined as unknown as string)).toBe(false);
    });
  });

  describe("isValidContractAddress", () => {
    it("returns true for a well-formed C... contract address", () => {
      expect(isValidContractAddress("CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC")).toBe(true);
    });

    it("returns false for a G... account address", () => {
      expect(isValidContractAddress("GDQXKBZLHQMQZIJKRWHMZNYJJXSM6SGONVDQTDIQCFZMVXASKHZRZ5A")).toBe(false);
    });
  });

  describe("getStellarKeyError", () => {
    it("returns null for a valid key", () => {
      expect(getStellarKeyError("GDQXKBZLHQMQZIJKRWHMZNYJJXSM6SGONVDQTDIQCFZMVXASKHZRZ5A")).toBeNull();
    });

    it("returns error for empty string", () => {
      expect(getStellarKeyError("")).toBe("Wallet address is required.");
    });

    it("returns prefix error for key not starting with G", () => {
      const err = getStellarKeyError("ADQXKBZLHQMQZIJKRWHMZNYJJXSM6SGONVDQTDIQCFZMVXASKHZRZ5A");
      expect(err).toContain("must start with 'G'");
    });

    it("returns length error for short key", () => {
      const err = getStellarKeyError("GABCD");
      expect(err).toContain("56 characters");
    });
  });

  describe("formatStellarAddress", () => {
    it("formats a long address with ellipsis", () => {
      const addr = "GDQXKBZLHQMQZIJKRWHMZNYJJXSM6SGONVDQTDIQCFZMVXASKHZRZ5A";
      const result = formatStellarAddress(addr, 4);
      expect(result).toContain("...");
      expect(result.startsWith("GDQXK")).toBe(true);
    });

    it("returns short string as-is", () => {
      expect(formatStellarAddress("GABC")).toBe("GABC");
    });
  });

  describe("isSameAccount", () => {
    it("returns true for identical addresses", () => {
      const addr = "GDQXKBZLHQMQZIJKRWHMZNYJJXSM6SGONVDQTDIQCFZMVXASKHZRZ5A";
      expect(isSameAccount(addr, addr)).toBe(true);
    });

    it("returns false for different addresses", () => {
      const a = "GDQXKBZLHQMQZIJKRWHMZNYJJXSM6SGONVDQTDIQCFZMVXASKHZRZ5A";
      const b = "GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGBDTZLDBBYEMRE12CNKEB";
      expect(isSameAccount(a, b)).toBe(false);
    });

    it("is case-insensitive (trims and uppercases)", () => {
      const addr = "  gdqxkbzlhqmqzijkrwhmznyjjxsm6sgonvdqtdiqcfzmvxaskhzrz5a  ";
      const upper = "GDQXKBZLHQMQZIJKRWHMZNYJJXSM6SGONVDQTDIQCFZMVXASKHZRZ5A";
      expect(isSameAccount(addr, upper)).toBe(true);
    });
  });
});
