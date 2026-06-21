"use client";

// Level 2: Multi-wallet selection modal using StellarWalletsKit
// Shows Freighter, xBull, and Albedo with availability detection + 3 error types.

import { useState } from "react";
import { useWallet, WALLET_IDS, type WalletId } from "@/lib/wallet-context";
import { WalletErrorType } from "@/lib/stellar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  Loader2,
  ExternalLink,
  ShieldAlert,
  CircleDollarSign,
  WifiOff,
} from "lucide-react";

interface WalletOption {
  id: WalletId;
  name: string;
  description: string;
  icon: string;
  installUrl: string;
}

const WALLET_OPTIONS: WalletOption[] = [
  {
    id: WALLET_IDS.FREIGHTER,
    name: "Freighter",
    description: "Official Stellar wallet by SDF",
    icon: "F",
    installUrl: "https://www.freighter.app/",
  },
  {
    id: WALLET_IDS.XBULL,
    name: "xBull",
    description: "Multi-platform Stellar wallet",
    icon: "X",
    installUrl: "https://xbull.app/",
  },
  {
    id: WALLET_IDS.ALBEDO,
    name: "Albedo",
    description: "Browser-based Stellar signer",
    icon: "A",
    installUrl: "https://albedo.link/",
  },
];

interface WalletSelectModalProps {
  open: boolean;
  onClose: () => void;
}

export function WalletSelectModal({ open, onClose }: WalletSelectModalProps) {
  const { connectWallet, isLoading, walletError, clearError } = useWallet();
  const [connectingId, setConnectingId] = useState<WalletId | null>(null);

  const handleConnect = async (walletId: WalletId) => {
    clearError();
    setConnectingId(walletId);
    await connectWallet(walletId);
    setConnectingId(null);
    // Close on success — walletError being null signals success
  };

  // Auto-close when connection succeeds (no error and not loading)
  const handleOpenChange = (v: boolean) => {
    if (!v) {
      clearError();
      onClose();
    }
  };

  // Level 2: render the correct error UI based on error type
  const ErrorBanner = () => {
    if (!walletError) return null;
    const config = {
      [WalletErrorType.NOT_FOUND]: {
        icon: WifiOff,
        color: "text-stellar-amber border-stellar-amber/30 bg-stellar-amber/5",
        title: "Wallet Not Found",
      },
      [WalletErrorType.REJECTED]: {
        icon: ShieldAlert,
        color: "text-destructive border-destructive/30 bg-destructive/5",
        title: "Connection Rejected",
      },
      [WalletErrorType.INSUFFICIENT_BALANCE]: {
        icon: CircleDollarSign,
        color: "text-destructive border-destructive/30 bg-destructive/5",
        title: "Insufficient Balance",
      },
      [WalletErrorType.UNKNOWN]: {
        icon: AlertCircle,
        color: "text-destructive border-destructive/30 bg-destructive/5",
        title: "Connection Failed",
      },
    }[walletError.type];

    const Icon = config.icon;
    const isNotFound = walletError.type === WalletErrorType.NOT_FOUND;

    return (
      <div className={`rounded-lg border px-3 py-2.5 flex items-start gap-2.5 ${config.color}`}>
        <Icon className="h-4 w-4 shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold">{config.title}</p>
          <p className="text-[11px] opacity-80 leading-relaxed mt-0.5">
            {walletError.message}
          </p>
          {isNotFound && (
            <a
              href={
                WALLET_OPTIONS.find((w) => w.id === connectingId)?.installUrl ??
                "https://www.freighter.app/"
              }
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-medium mt-1.5 underline underline-offset-2"
            >
              Install extension <ExternalLink className="h-2.5 w-2.5" />
            </a>
          )}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-card border-border max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-foreground">Connect Wallet</DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            Choose a Stellar wallet to connect. All wallets run on Testnet.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 py-1">
          <ErrorBanner />

          {WALLET_OPTIONS.map((wallet) => {
            const isConnecting = isLoading && connectingId === wallet.id;
            return (
              <button
                key={wallet.id}
                onClick={() => handleConnect(wallet.id)}
                disabled={isLoading}
                className="flex items-center gap-3 rounded-xl border border-border bg-background hover:bg-accent hover:border-stellar-teal/30 transition-all p-3.5 text-left disabled:opacity-60 disabled:cursor-not-allowed group"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-stellar-teal/10 text-stellar-teal font-bold text-sm shrink-0 group-hover:bg-stellar-teal/20 transition-colors">
                  {wallet.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-foreground">
                      {wallet.name}
                    </p>
                    {wallet.id === WALLET_IDS.ALBEDO && (
                      <Badge
                        variant="outline"
                        className="text-[9px] h-3.5 px-1 border-stellar-teal/30 text-stellar-teal"
                      >
                        No install
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {wallet.description}
                  </p>
                </div>
                {isConnecting && (
                  <Loader2 className="h-4 w-4 animate-spin text-stellar-teal shrink-0" />
                )}
              </button>
            );
          })}

          <p className="text-center text-[11px] text-muted-foreground pt-1">
            New to Stellar?{" "}
            <a
              href="https://www.freighter.app/"
              target="_blank"
              rel="noreferrer"
              className="text-stellar-teal hover:underline"
            >
              Get Freighter
            </a>{" "}
            — the official browser extension.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
