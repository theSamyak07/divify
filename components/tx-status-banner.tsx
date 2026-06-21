"use client";

// Level 2: Persistent transaction status indicator visible at the top of the dashboard.
// Shows pending / signing / submitting / success / error states.

import { useWallet } from "@/lib/wallet-context";
import { CheckCircle2, XCircle, Loader2, Pen, Send } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_CONFIG = {
  pending: {
    icon: Loader2,
    label: "Building transaction...",
    spin: true,
    className: "bg-stellar-teal/10 border-stellar-teal/20 text-stellar-teal",
  },
  signing: {
    icon: Pen,
    label: "Waiting for wallet signature...",
    spin: false,
    className: "bg-stellar-amber/10 border-stellar-amber/20 text-stellar-amber",
  },
  submitting: {
    icon: Send,
    label: "Submitting to Stellar network...",
    spin: false,
    className: "bg-stellar-teal/10 border-stellar-teal/20 text-stellar-teal",
  },
  success: {
    icon: CheckCircle2,
    label: "Transaction confirmed on Testnet.",
    spin: false,
    className: "bg-stellar-green/10 border-stellar-green/20 text-stellar-green",
  },
  error: {
    icon: XCircle,
    label: "Transaction failed.",
    spin: false,
    className: "bg-destructive/10 border-destructive/20 text-destructive",
  },
} as const;

export function TxStatusBanner() {
  const { txStatus } = useWallet();

  if (txStatus === "idle") return null;

  const config = STATUS_CONFIG[txStatus];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "flex items-center gap-2.5 rounded-lg border px-4 py-2.5 text-sm font-medium animate-in fade-in slide-in-from-top-2 duration-300",
        config.className
      )}
    >
      <Icon
        className={cn("h-4 w-4 shrink-0", config.spin && "animate-spin")}
      />
      <span>{config.label}</span>
    </div>
  );
}
