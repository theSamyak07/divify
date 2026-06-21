"use server";

// All @stellar/stellar-sdk usage lives here — server-only.
// This file is never bundled for the browser.
import { Horizon, Asset, TransactionBuilder, Operation, Memo, BASE_FEE } from "@stellar/stellar-sdk";
import type { StellarBalance, TransactionResult, PaymentRecord } from "./stellar";
import { STELLAR_HORIZON_URL, STELLAR_NETWORK_PASSPHRASE } from "./stellar";

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
