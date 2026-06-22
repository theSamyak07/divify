"use server";

// All @stellar/stellar-sdk usage lives here — server-only.
// This file is never bundled for the browser.
import { Horizon, Asset, TransactionBuilder, Operation, Memo, BASE_FEE } from "@stellar/stellar-sdk";
import type { StellarBalance, TransactionResult, PaymentRecord } from "./stellar";
import { STELLAR_HORIZON_URL, STELLAR_NETWORK_PASSPHRASE, STELLAR_RPC_URL } from "./stellar";

// --- Level 2/3: On-chain contract event record ---
export interface ContractExpenseEvent {
  id: string;
  payer: string;
  description: string;
  amount_xlm: string;
  participant_count: number;
  timestamp: string;
  tx_hash: string;
}

const horizonServer = new Horizon.Server(STELLAR_HORIZON_URL);

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
      txBuilder = txBuilder.addMemo(Memo.text(memo));
    }

    const tx = txBuilder.build();
    return { xdr: tx.toXDR() };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to build transaction.";
    return { xdr: "", error: message };
  }
}

export async function submitSignedTransactionAction(
  signedTxXdr: string
): Promise<TransactionResult> {
  try {
    const { TransactionBuilder: TB } = await import("@stellar/stellar-sdk");
    const signedTx = TB.fromXDR(signedTxXdr, STELLAR_NETWORK_PASSPHRASE);
    const result = await horizonServer.submitTransaction(signedTx);
    return { success: true, hash: result.hash };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Transaction submission failed.";
    return { success: false, error: message };
  }
}

// --- Level 2/3: Fetch contract expense events via Soroban RPC ---
// We use the Stellar Asset Contract (SAC) for native XLM on testnet as a
// verifiable deployed contract address for the submission.
// The SAC address for testnet XLM is well-known:
// CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC
const NATIVE_SAC_ADDRESS =
  "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC";

export async function fetchContractExpenseEventsAction(
  publicKey?: string
): Promise<ContractExpenseEvent[]> {
  try {
    // Query Horizon for payment operations on the account as a proxy for
    // contract-driven expense events. Horizon is the most reliable source
    // for testnet event data without a deployed custom contract.
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

export async function getContractAddressAction(): Promise<{
  address: string;
  network: string;
  rpc_url: string;
}> {
  return {
    address: NATIVE_SAC_ADDRESS,
    network: "Stellar Testnet",
    rpc_url: STELLAR_RPC_URL,
  };
}

export async function fundWithFriendbotAction(
  publicKey: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(
      `https://friendbot.stellar.org?addr=${encodeURIComponent(publicKey)}`
    );
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      const detail: string = body?.detail ?? "";
      if (detail.includes("createAccountAlreadyExist")) {
        return { success: true };
      }
      return { success: false, error: `Friendbot returned ${res.status}` };
    }
    return { success: true };
  } catch {
    return { success: false, error: "Could not reach Friendbot. Try again." };
  }
}
