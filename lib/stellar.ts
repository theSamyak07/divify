// Pure utility functions — NO @stellar/stellar-sdk imports here.
// This file is imported by client components, so it must be browser-safe.
// All SDK operations (Horizon, TransactionBuilder, etc.) live in stellar-actions.ts

export const STELLAR_NETWORK = "TESTNET";
export const STELLAR_HORIZON_URL = "https://horizon-testnet.stellar.org";
export const STELLAR_NETWORK_PASSPHRASE = "Test SDF Network ; September 2015";
export const STELLAR_RPC_URL = "https://soroban-testnet.stellar.org";

// --- Level 2: Explicit wallet error types ---
export enum WalletErrorType {
  NOT_FOUND = "WALLET_NOT_FOUND",
  REJECTED = "WALLET_REJECTED",
  INSUFFICIENT_BALANCE = "INSUFFICIENT_BALANCE",
  UNKNOWN = "UNKNOWN_ERROR",
}

export interface WalletError {
  type: WalletErrorType;
  message: string;
}

export function classifyWalletError(raw: string): WalletError {
  const msg = raw.toLowerCase();
  if (msg.includes("not found") || msg.includes("not installed") || msg.includes("extension")) {
    return { type: WalletErrorType.NOT_FOUND, message: raw };
  }
  if (
    msg.includes("reject") ||
    msg.includes("denied") ||
    msg.includes("cancel") ||
    msg.includes("user declined")
  ) {
    return { type: WalletErrorType.REJECTED, message: raw };
  }
  if (
    msg.includes("insufficient") ||
    msg.includes("balance") ||
    msg.includes("underfunded")
  ) {
    return { type: WalletErrorType.INSUFFICIENT_BALANCE, message: raw };
  }
  return { type: WalletErrorType.UNKNOWN, message: raw };
}

// --- Level 2: Transaction status tracking ---
export type TxStatus = "idle" | "pending" | "signing" | "submitting" | "success" | "error";

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
