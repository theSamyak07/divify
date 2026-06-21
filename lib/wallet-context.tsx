"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  fetchAccountBalances,
  getXLMBalance,
  StellarBalance,
  TransactionResult,
  STELLAR_NETWORK_PASSPHRASE,
  STELLAR_HORIZON_URL,
  horizonServer,
} from "./stellar";
import { Asset, TransactionBuilder, Operation, Memo, BASE_FEE } from "@stellar/stellar-sdk";

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

declare global {
  interface Window {
    freighter?: {
      isConnected: () => Promise<{ isConnected: boolean }>;
      getAddress: () => Promise<{ address: string }>;
      signTransaction: (
        xdr: string,
        opts?: { networkPassphrase?: string }
      ) => Promise<{ signedTxXdr: string }>;
    };
    freighterApi?: {
      isConnected: () => Promise<boolean>;
      getPublicKey: () => Promise<string>;
      signTransaction: (
        xdr: string,
        network: string
      ) => Promise<string>;
    };
  }
}

async function isFreighterInstalled(): Promise<boolean> {
  // Give the extension time to inject
  await new Promise((r) => setTimeout(r, 100));
  return !!(window.freighter || window.freighterApi);
}

async function freighterConnect(): Promise<string | null> {
  if (window.freighter) {
    const result = await window.freighter.getAddress();
    return result.address;
  }
  if (window.freighterApi) {
    return await window.freighterApi.getPublicKey();
  }
  return null;
}

async function freighterSignTx(xdr: string): Promise<string | null> {
  if (window.freighter) {
    const result = await window.freighter.signTransaction(xdr, {
      networkPassphrase: STELLAR_NETWORK_PASSPHRASE,
    });
    return result.signedTxXdr;
  }
  if (window.freighterApi) {
    return await window.freighterApi.signTransaction(xdr, "TESTNET");
  }
  return null;
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [balances, setBalances] = useState<StellarBalance[]>([]);
  const [xlmBalance, setXlmBalance] = useState("0");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadBalances = useCallback(async (pk: string) => {
    const b = await fetchAccountBalances(pk);
    setBalances(b);
    setXlmBalance(getXLMBalance(b));
  }, []);

  // Auto-reconnect if previously connected
  useEffect(() => {
    const stored = localStorage.getItem("divify_wallet");
    if (stored) {
      setPublicKey(stored);
      setIsConnected(true);
      loadBalances(stored);
    }
  }, [loadBalances]);

  const connectWallet = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const installed = await isFreighterInstalled();
      if (!installed) {
        throw new Error(
          "Freighter wallet not found. Please install the Freighter browser extension."
        );
      }
      const pk = await freighterConnect();
      if (!pk) throw new Error("Could not retrieve public key from Freighter.");
      setPublicKey(pk);
      setIsConnected(true);
      localStorage.setItem("divify_wallet", pk);
      await loadBalances(pk);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Wallet connection failed.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [loadBalances]);

  const disconnectWallet = useCallback(() => {
    setPublicKey(null);
    setIsConnected(false);
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
        const account = await horizonServer.loadAccount(publicKey);
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
        const xdr = tx.toXDR();

        const signedXdr = await freighterSignTx(xdr);
        if (!signedXdr) throw new Error("Transaction signing cancelled.");

        const { TransactionBuilder: TB } = await import("@stellar/stellar-sdk");
        const signedTx = TB.fromXDR(signedXdr, STELLAR_NETWORK_PASSPHRASE);
        const result = await horizonServer.submitTransaction(signedTx);

        await loadBalances(publicKey);

        return { success: true, hash: result.hash };
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
        isConnected,
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
