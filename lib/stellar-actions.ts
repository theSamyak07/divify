"use server";

// All @stellar/stellar-sdk usage lives here — server-only.
// This file is never bundled for the browser.
import {
  Horizon,
  Asset,
  TransactionBuilder,
  Operation,
  Memo,
  BASE_FEE,
} from "@stellar/stellar-sdk";
import type {
  StellarBalance,
  TransactionResult,
  PaymentRecord,
} from "./stellar";
import {
  STELLAR_HORIZON_URL,
  STELLAR_NETWORK_PASSPHRASE,
  STELLAR_RPC_URL,
} from "./stellar";

// ---------------------------------------------------------------------------
// Contract address
// ---------------------------------------------------------------------------

/**
 * DivifySplitter contract address on Stellar Testnet.
 * Deployed via: stellar contract deploy --wasm divify_splitter.wasm --network testnet
 */
export const DIVIFY_CONTRACT_ADDRESS =
  "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Represents a contract expense event emitted by DivifySplitter. */
export interface ContractExpenseEvent {
  id: string;
  payer: string;
  description: string;
  amount_xlm: string;
  participant_count: number;
  timestamp: string;
  tx_hash: string;
}

// ---------------------------------------------------------------------------
// Horizon server instance (server-only)
// ---------------------------------------------------------------------------

const horizonServer = new Horizon.Server(STELLAR_HORIZON_URL);

// ---------------------------------------------------------------------------
// Account & balance actions
// ---------------------------------------------------------------------------

/** Fetch all balances for a Stellar account. Returns [] if not found. */
export async function fetchAccountBalancesAction(
  publicKey: string
): Promise<StellarBalance[]> {
  try {
    const account = await horizonServer.loadAccount(publicKey);
    return account.balances as StellarBalance[];
  } catch {
    // Account may not yet exist on testnet — return empty silently
    return [];
  }
}

/** Fetch recent payments for a Stellar account (last 10). */
export async function fetchPaymentsAction(
  publicKey: string
): Promise<PaymentRecord[]> {
  try {
    const result = await horizonServer
      .payments()
      .forAccount(publicKey)
      .order("desc")
      .limit(10)
      .call();
    const records = result.records as unknown as PaymentRecord[];
    return records.filter(
      (r) => r.type === "payment" || r.type === "create_account"
    );
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Transaction building & submission
// ---------------------------------------------------------------------------

/**
 * Build an unsigned XLM payment transaction XDR (runs server-side only).
 * The result is passed back to the browser for signing via StellarWalletsKit.
 */
export async function buildUnsignedTransactionAction(
  sourcePublicKey: string,
  destination: string,
  amount: string,
  memo?: string
): Promise<{ xdr: string; error?: string }> {
  try {
    const account = await horizonServer.loadAccount(sourcePublicKey);
    let txBuilder = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: STELLAR_NETWORK_PASSPHRASE,
    })
      .addOperation(
        Operation.payment({
          destination,
          asset: Asset.native(),
          amount,
        })
      )
      .setTimeout(30);

    if (memo) {
      // Stellar text memo limit is 28 bytes
      txBuilder = txBuilder.addMemo(Memo.text(memo.slice(0, 28)));
    }

    const tx = txBuilder.build();
    return { xdr: tx.toXDR() };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to build transaction.";
    return { xdr: "", error: message };
  }
}

/**
 * Submit a signed transaction XDR to Stellar Horizon (server-side).
 * Returns the transaction hash on success.
 */
export async function submitSignedTransactionAction(
  signedTxXdr: string
): Promise<TransactionResult> {
  try {
    const { TransactionBuilder: TB } = await import("@stellar/stellar-sdk");
    const signedTx = TB.fromXDR(signedTxXdr, STELLAR_NETWORK_PASSPHRASE);
    const result = await horizonServer.submitTransaction(signedTx);
    return { success: true, hash: result.hash };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Transaction submission failed.";
    return { success: false, error: message };
  }
}

// ---------------------------------------------------------------------------
// Contract event fetching
// ---------------------------------------------------------------------------

/**
 * Fetch expense-related events for a wallet by querying Horizon payment ops.
 *
 * These are real Stellar Testnet transactions — either direct XLM payments
 * made via the Expense Splitter "Send" button, or future Soroban contract
 * invocations. Both appear as native payment operations on Horizon.
 */
export async function fetchContractExpenseEventsAction(
  publicKey?: string
): Promise<ContractExpenseEvent[]> {
  try {
    const url = publicKey
      ? `${STELLAR_HORIZON_URL}/accounts/${publicKey}/payments?order=desc&limit=20`
      : `${STELLAR_HORIZON_URL}/payments?order=desc&limit=10`;

    const res = await fetch(url, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return [];
    const data = await res.json();

    const records = (data._embedded?.records ?? []) as Array<{
      id: string;
      transaction_hash: string;
      created_at: string;
      from: string;
      to: string;
      amount: string;
      asset_type: string;
      transaction_memo?: string;
    }>;

    return records
      .filter((r) => r.asset_type === "native" && r.from === publicKey)
      .map((r) => ({
        id: r.id,
        payer: r.from,
        description: r.transaction_memo ?? "Divify Split",
        amount_xlm: r.amount,
        participant_count: 1,
        timestamp: r.created_at,
        tx_hash: r.transaction_hash,
      }));
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Contract metadata
// ---------------------------------------------------------------------------

/** Return the deployed DivifySplitter contract metadata. */
export async function getContractAddressAction(): Promise<{
  address: string;
  network: string;
  rpc_url: string;
}> {
  return {
    address: DIVIFY_CONTRACT_ADDRESS,
    network: "Stellar Testnet",
    rpc_url: STELLAR_RPC_URL,
  };
}

// ---------------------------------------------------------------------------
// Friendbot funding
// ---------------------------------------------------------------------------

/**
 * Fund a testnet account with 10,000 XLM via Stellar Friendbot.
 * Works for new accounts only — existing accounts are silently skipped.
 */
export async function fundWithFriendbotAction(
  publicKey: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(
      `https://friendbot.stellar.org?addr=${encodeURIComponent(publicKey)}`
    );
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      const detail: string = (body as { detail?: string })?.detail ?? "";
      if (detail.includes("createAccountAlreadyExist")) {
        return { success: true };
      }
      return { success: false, error: `Friendbot returned ${res.status}` };
    }
    return { success: true };
  } catch {
    return {
      success: false,
      error: "Could not reach Friendbot. Try again.",
    };
  }
}
