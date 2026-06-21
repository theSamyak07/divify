// Pure utility functions — NO @stellar/stellar-sdk imports here.
// This file is imported by client components, so it must be browser-safe.
// All SDK operations (Horizon, TransactionBuilder, etc.) live in stellar-actions.ts

export const STELLAR_NETWORK = "TESTNET";
export const STELLAR_HORIZON_URL = "https://horizon-testnet.stellar.org";
export const STELLAR_NETWORK_PASSPHRASE = "Test SDF Network ; September 2015";

export function shortenAddress(address: string, chars = 6): string {
  if (!address) return "";
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export function formatXLM(amount: string | number): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 7,
  });
}

export interface StellarBalance {
  asset_type: string;
  asset_code?: string;
  asset_issuer?: string;
  balance: string;
}

export function getXLMBalance(balances: StellarBalance[]): string {
  const xlm = balances.find((b) => b.asset_type === "native");
  return xlm ? xlm.balance : "0";
}

export interface TransactionResult {
  success: boolean;
  hash?: string;
  error?: string;
}

export interface PaymentRecord {
  id: string;
  type: string;
  transaction_hash: string;
  created_at: string;
  from: string;
  to: string;
  amount: string;
  asset_type: string;
  asset_code?: string;
  transaction_successful: boolean;
}
