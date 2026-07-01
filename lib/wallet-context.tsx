"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  StellarWalletsKit,
  initWalletKit,
  isKitReady,
} from "./wallet-kit";
import {
  getXLMBalance,
  classifyWalletError,
  WalletErrorType,
  STELLAR_NETWORK_PASSPHRASE,
  shortenAddress,
  type StellarBalance,
  type TransactionResult,
  type TxStatus,
  type WalletError,
} from "./stellar";
import {
  fetchAccountBalancesAction,
  buildUnsignedTransactionAction,
  submitSignedTransactionAction,
} from "./stellar-actions";
import { logUserActivity } from "./supabase";

// Wallet IDs from StellarWalletsKit
export const WALLET_IDS = {
  FREIGHTER: "freighter",
  XBULL: "xbull",
  ALBEDO: "albedo",
} as const;

export type WalletId = (typeof WALLET_IDS)[keyof typeof WALLET_IDS];

interface WalletContextType {
  isConnected: boolean;
  publicKey: string | null;
  balances: StellarBalance[];
  xlmBalance: string;
  isLoading: boolean;
  walletError: WalletError | null;
  activeWalletId: WalletId | null;
  txStatus: TxStatus;
  connectWallet: (walletId?: WalletId) => Promise<void>;
  disconnectWallet: () => void;
  refreshBalance: () => Promise<void>;
  sendXLM: (
    destination: string,
    amount: string,
    memo?: string
  ) => Promise<TransactionResult>;
  clearError: () => void;
}

const WalletContext = createContext<WalletContextType | null>(null);

const STORAGE_KEY = "divify_wallet_v2";

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [connected, setConnected] = useState(false);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [balances, setBalances] = useState<StellarBalance[]>([]);
  const [xlmBalance, setXlmBalance] = useState("0");
  const [isLoading, setIsLoading] = useState(false);
  const [walletError, setWalletError] = useState<WalletError | null>(null);
  const [activeWalletId, setActiveWalletId] = useState<WalletId | null>(null);
  const [txStatus, setTxStatus] = useState<TxStatus>("idle");

  const loadBalances = useCallback(async (pk: string) => {
    const b = await fetchAccountBalancesAction(pk);
    setBalances(b);
    setXlmBalance(getXLMBalance(b));
  }, []);

  // Boot Pendo SDK once with an anonymous visitor
  useEffect(() => {
    pendo.initialize({ visitor: { id: '' } });
  }, []);

  // Auto-reconnect on page load using persisted wallet ID
  useEffect(() => {
    async function tryAutoReconnect() {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return;
      try {
        const { walletId, address } = JSON.parse(stored) as {
          walletId: WalletId;
          address: string;
        };
        await initWalletKit();
        if (!isKitReady()) return;
        StellarWalletsKit.setWallet(walletId);
        setPublicKey(address);
        setConnected(true);
        setActiveWalletId(walletId);
        await loadBalances(address);
        pendo.identify({
          visitor: {
            id: address,
            activeWalletId: walletId,
          },
        });
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    tryAutoReconnect();
  }, [loadBalances]);

  const connectWallet = useCallback(
    async (walletId: WalletId = WALLET_IDS.FREIGHTER) => {
      setIsLoading(true);
      setWalletError(null);
      try {
        // Level 2: ensure kit is initialised before connecting
        await initWalletKit();

        if (!isKitReady()) {
          // Kit failed to init — most likely the wallet extension is not installed
          throw new Error(
            `${walletId} wallet extension not found. Please install it and try again.`
          );
        }

        StellarWalletsKit.setWallet(walletId);

        // Level 2 error type: WALLET_NOT_FOUND if module not available
        let address: string;
        try {
          const result = await StellarWalletsKit.fetchAddress();
          address = result.address;
        } catch (innerErr: unknown) {
          const msg =
            innerErr instanceof Error
              ? innerErr.message
              : "Wallet connection failed.";
          throw new Error(msg);
        }

        if (!address) {
          throw new Error("Wallet did not return a public key.");
        }

        setPublicKey(address);
        setConnected(true);
        setActiveWalletId(walletId);
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ walletId, address })
        );
        await loadBalances(address);
        pendo.identify({
          visitor: {
            id: address,
            activeWalletId: walletId,
          },
        });
        void logUserActivity(address, "wallet_connected", walletId);
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Wallet connection failed.";
        // Level 2: classify into one of the 3 error types
        setWalletError(classifyWalletError(message));
      } finally {
        setIsLoading(false);
      }
    },
    [loadBalances]
  );

  const disconnectWallet = useCallback(() => {
    setPublicKey(null);
    setConnected(false);
    setBalances([]);
    setXlmBalance("0");
    setWalletError(null);
    setActiveWalletId(null);
    setTxStatus("idle");
    localStorage.removeItem(STORAGE_KEY);
    pendo.clearSession();
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
      if (!publicKey)
        return { success: false, error: "Wallet not connected." };

      // Level 2: explicit insufficient balance check
      const balance = parseFloat(xlmBalance);
      const needed = parseFloat(amount);
      if (needed > balance) {
        const err = classifyWalletError("Insufficient balance");
        setWalletError(err);
        return {
          success: false,
          error: `Insufficient balance: you have ${balance.toFixed(2)} XLM but need ${needed.toFixed(2)} XLM.`,
        };
      }

      try {
        setTxStatus("pending");

        // Step 1: build the unsigned transaction on the server
        const { xdr, error: buildErr } = await buildUnsignedTransactionAction(
          publicKey,
          destination,
          amount,
          memo
        );
        if (buildErr || !xdr) {
          setTxStatus("error");
          return {
            success: false,
            error: buildErr ?? "Failed to build transaction.",
          };
        }

        setTxStatus("signing");

        // Step 2: sign in the browser via StellarWalletsKit (supports all wallets)
        let signedTxXdr: string;
        try {
          const sigResult = await StellarWalletsKit.signTransaction(xdr, {
            networkPassphrase: STELLAR_NETWORK_PASSPHRASE,
            address: publicKey,
          });
          signedTxXdr = sigResult.signedTxXdr;
        } catch (signErr: unknown) {
          const msg =
            signErr instanceof Error ? signErr.message : "Signing failed.";
          // Level 2: classify as rejected if user cancelled
          const classified = classifyWalletError(msg);
          if (classified.type === WalletErrorType.REJECTED) {
            setTxStatus("idle");
            return { success: false, error: "Transaction cancelled by user." };
          }
          throw signErr;
        }

        if (!signedTxXdr) {
          setTxStatus("error");
          return { success: false, error: "Transaction signing cancelled." };
        }

        setTxStatus("submitting");

        // Step 3: submit via server action
        const result = await submitSignedTransactionAction(signedTxXdr);
        if (result.success) {
          setTxStatus("success");
          await loadBalances(publicKey);
          void logUserActivity(
            publicKey,
            "payment_sent",
            `${amount} XLM to ${shortenAddress(destination)}`,
            result.hash,
            parseFloat(amount)
          );
          // Reset to idle after a delay
          setTimeout(() => setTxStatus("idle"), 4000);
        } else {
          setTxStatus("error");
          const classified = classifyWalletError(result.error ?? "");
          if (classified.type === WalletErrorType.INSUFFICIENT_BALANCE) {
            setWalletError(classified);
          }
          setTimeout(() => setTxStatus("idle"), 4000);
        }
        return result;
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Transaction failed.";
        setTxStatus("error");
        setTimeout(() => setTxStatus("idle"), 4000);
        return { success: false, error: message };
      }
    },
    [publicKey, xlmBalance, loadBalances]
  );

  return (
    <WalletContext.Provider
      value={{
        isConnected: connected,
        publicKey,
        balances,
        xlmBalance,
        isLoading,
        walletError,
        activeWalletId,
        txStatus,
        connectWallet,
        disconnectWallet,
        refreshBalance,
        sendXLM,
        clearError: () => setWalletError(null),
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
