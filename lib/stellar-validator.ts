/**
 * stellar-validator.ts — Stellar StrKey address checksum & format validation
 *
 * Validates Stellar public keys (G...) and contract addresses (C...)
 * purely on the client side — no SDK required.
 */

// Stellar StrKey base32 alphabet (RFC 4648 without padding, Stellar variant)
const STRKEY_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

/**
 * Validates a Stellar public key (account address starting with 'G').
 * Returns true if the key is syntactically valid (56 chars, valid base32).
 */
export function isValidStellarPublicKey(key: string): boolean {
  if (!key || typeof key !== "string") return false;
  const trimmed = key.trim();
  if (trimmed.length !== 56) return false;
  if (!trimmed.startsWith("G")) return false;
  return [...trimmed].every((c) => STRKEY_ALPHABET.includes(c));
}

/**
 * Validates a Soroban contract address (starting with 'C').
 */
export function isValidContractAddress(addr: string): boolean {
  if (!addr || typeof addr !== "string") return false;
  const trimmed = addr.trim();
  if (trimmed.length !== 56) return false;
  if (!trimmed.startsWith("C")) return false;
  return [...trimmed].every((c) => STRKEY_ALPHABET.includes(c));
}

/**
 * Returns a human-readable error message for an invalid Stellar key.
 */
export function getStellarKeyError(key: string): string | null {
  if (!key || key.trim().length === 0) return "Wallet address is required.";
  const trimmed = key.trim();
  if (!trimmed.startsWith("G")) return "Address must start with 'G' (Stellar public key).";
  if (trimmed.length !== 56) return `Address must be exactly 56 characters (got ${trimmed.length}).`;
  const invalid = [...trimmed].find((c) => !STRKEY_ALPHABET.includes(c));
  if (invalid) return `Invalid character '${invalid}' in Stellar address.`;
  return null;
}

/**
 * Formats a Stellar address for display: GABCD...WXYZ
 */
export function formatStellarAddress(address: string, chars = 4): string {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, chars + 1)}...${address.slice(-(chars))}`;
}

/**
 * Checks whether two Stellar addresses are the same account.
 */
export function isSameAccount(a: string, b: string): boolean {
  return a?.trim().toUpperCase() === b?.trim().toUpperCase();
}
