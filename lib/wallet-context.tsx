"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  isConnected as freighterIsConnected,
  requestAccess,
  getAddress,
  signTransaction,
} from "@stellar/freighter-api";
import {
  getXLMBalance,
  StellarBalance,
  TransactionResult,
  STELLAR_NETWORK_PASSPHRASE,
} from "./stellar";
import {
  fetchAccountBalancesAction,
  buildUnsignedTransactionAction,
  submitSignedTransactionAction,
} from "./stellar-actions";

interface WalletContextType {
  isConnected: boolean;
  publicKey: string | null;
  balances: StellarBalance[];
  xlmBalance: string;
  isLoading: boolean;
  error: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  refreshBalance: () => Promise<void>;
  sendXLM: (
    destination: string,
    amount: string,
    memo?: string
  ) => Promise<TransactionResult>;
}

const WalletContext = createContext<WalletContextType | null>(null);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [connected, setConnected] = useState(false);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [balances, setBalances] = useState<StellarBalance[]>([]);
  const [xlmBalance, setXlmBalance] = useState("0");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadBalances = useCallback(async (pk: string) => {
    const b = await fetchAccountBalancesAction(pk);
    setBalances(b);
    setXlmBalance(getXLMBalance(b));
  }, []);

  // Auto-reconnect on page load if the user already authorized this app
  useEffect(() => {
    async function tryAutoReconnect() {
      const stored = localStorage.getItem("divify_wallet");
      if (!stored) return;
      try {
        const { isConnected: installed } = await freighterIsConnected();
        if (!installed) return;
        // getAddress() is silent — no popup — only succeeds if already authorized
        const { address, error: addrErr } = await getAddress();
        if (addrErr || !address) return;
        setPublicKey(address);
        setConnected(true);
        await loadBalances(address);
      } catch {
        localStorage.removeItem("divify_wallet");
      }
    }
    tryAutoReconnect();
  }, [loadBalances]);

  const connectWallet = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { isConnected: installed } = await freighterIsConnected();
      if (!installed) {
        throw new Error(
          "Freighter wallet not found. Install the Freighter extension for Firefox or Chrome and try again."
        );
      }
      // requestAccess() triggers the Freighter popup and returns the public key
      const { address, error: accessErr } = await requestAccess();
      if (accessErr) {
        throw new Error(accessErr.message || "Access was denied by Freighter.");
      }
      if (!address) {
        throw new Error("Freighter did not return a public key.");
      }
      setPublicKey(address);
      setConnected(true);
      localStorage.setItem("divify_wallet", address);
      await loadBalances(address);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Wallet connection failed.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [loadBalances]);

  const disconnectWallet = useCallback(() => {
    setPublicKey(null);
    setConnected(false);
    setBalances([]);
    setXlmBalance("0");
    setError(null);
    localStorage.removeItem("divify_wallet");
  }, []);

  const refreshBalance = useCallback(async () => {
    if (!publicKey) return;
    await loadBalances(publicKey);
  }, [publicKey, loadBalances]);

  const sendXLM = useCallback(
    async (
      destination: string,
      amount: string,
      memo?: string
    ): Promise<TransactionResult> => {
      if (!publicKey) return { success: false, error: "Wallet not connected." };
      try {
        // Step 1: build the unsigned transaction on the server
        const { xdr, error: buildErr } = await buildUnsignedTransactionAction(
          publicKey,
          destination,
          amount,
          memo
        );
        if (buildErr || !xdr) {
          return { success: false, error: buildErr ?? "Failed to build transaction." };
        }

        // Step 2: sign it in the browser with Freighter (client-side only)
        const { signedTxXdr, error: signErr } = await signTransaction(xdr, {
          networkPassphrase: STELLAR_NETWORK_PASSPHRASE,
          address: publicKey,
        });
        if (signErr) {
          throw new Error(signErr.message || "Transaction signing failed.");
        }
        if (!signedTxXdr) {
          throw new Error("Transaction signing cancelled.");
        }

        // Step 3: submit the signed XDR on the server
        const result = await submitSignedTransactionAction(signedTxXdr);
        if (result.success) {
          await loadBalances(publicKey);
        }
        return result;
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Transaction failed.";
        return { success: false, error: message };
      }
    },
    [publicKey, loadBalances]
  );

  return (
    <WalletContext.Provider
      value={{
        isConnected: connected,
        publicKey,
        balances,
        xlmBalance,
        isLoading,
        error,
        connectWallet,
        disconnectWallet,
        refreshBalance,
        sendXLM,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet(): WalletContextType {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within WalletProvider");
  return ctx;
}
