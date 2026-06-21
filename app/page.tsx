"use client";

import { useState } from "react";
import { DivifyHeader } from "@/components/divify-header";
import { WalletOverview } from "@/components/wallet-overview";
import { ExpenseSplitter } from "@/components/expense-splitter";
import { ActivityFeed } from "@/components/activity-feed";
import { SendPaymentModal } from "@/components/send-payment-modal";
import { WalletSelectModal } from "@/components/wallet-select-modal";
import { TxStatusBanner } from "@/components/tx-status-banner";
import { ContractInfo } from "@/components/contract-info";
import { useWallet } from "@/lib/wallet-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Wallet,
  Split,
  Zap,
  Globe,
  Shield,
  ChevronRight,
  Loader2,
  FileCode2,
} from "lucide-react";

function HeroSection({
  onConnectClick,
}: {
  onConnectClick: () => void;
}) {
  const { isConnected, isLoading } = useWallet();

  if (isConnected) return null;

  return (
    <div className="flex flex-col items-center justify-center text-center px-4 sm:px-6 py-12 md:py-24 max-w-3xl mx-auto">
      <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
        <Badge
          variant="outline"
          className="border-stellar-teal/30 text-stellar-teal px-3 py-1 text-xs font-medium"
        >
          White Belt
        </Badge>
        <Badge
          variant="outline"
          className="border-yellow-500/40 text-yellow-500 px-3 py-1 text-xs font-medium"
        >
          Yellow Belt
        </Badge>
        <Badge
          variant="outline"
          className="border-orange-500/40 text-orange-500 px-3 py-1 text-xs font-medium"
        >
          Orange Belt
        </Badge>
      </div>
      <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-foreground tracking-tight text-balance mb-4">
        Split expenses.{" "}
        <span className="text-stellar-teal">Pay instantly.</span>
      </h1>
      <p className="text-base sm:text-lg text-muted-foreground text-pretty max-w-xl mb-8 leading-relaxed">
        Divify is a smart expense splitter built on Stellar. Split group bills,
        send XLM directly via multiple wallets, and interact with deployed
        smart contracts — no banks, no delays, no trust required.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-3 mb-12 w-full sm:w-auto">
        <Button
          onClick={onConnectClick}
          disabled={isLoading}
          size="lg"
          className="w-full sm:w-auto bg-stellar-teal text-primary-foreground hover:bg-stellar-teal/90 gap-2 px-8"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Wallet className="h-5 w-5" />
          )}
          {isLoading ? "Connecting..." : "Connect Wallet"}
        </Button>
        <a
          href="https://www.freighter.app/"
          target="_blank"
          rel="noreferrer"
          className="w-full sm:w-auto"
        >
          <Button
            variant="outline"
            size="lg"
            className="w-full border-border text-foreground gap-2"
          >
            Get Freighter
            <ChevronRight className="h-4 w-4" />
          </Button>
        </a>
      </div>

      {/* Feature highlights — mobile-first single column, 3 cols on sm+ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-2xl">
        {[
          {
            icon: Split,
            title: "Multi-Wallet Support",
            desc: "Connect via Freighter, xBull, or Albedo — your choice.",
          },
          {
            icon: Zap,
            title: "Smart Contract Driven",
            desc: "Expenses logged to a deployed Stellar Testnet contract.",
          },
          {
            icon: Shield,
            title: "Real-time Events",
            desc: "Live contract event streaming with 15s polling updates.",
          },
        ].map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4 text-left"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-stellar-teal/10">
              <Icon className="h-4 w-4 text-stellar-teal" />
            </div>
            <p className="text-sm font-semibold text-foreground">{title}</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {desc}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Globe className="h-3.5 w-3.5" />
          Stellar Testnet
        </span>
        <span className="text-border hidden sm:inline">·</span>
        <span className="flex items-center gap-1">
          <FileCode2 className="h-3.5 w-3.5" />
          Deployed Contract
        </span>
        <span className="text-border hidden sm:inline">·</span>
        <span>Stellar Journey to Mastery — Level 1 / 2 / 3</span>
      </div>
    </div>
  );
}

function Dashboard({
  onSendClick,
}: {
  onSendClick: () => void;
}) {
  const { isConnected } = useWallet();

  if (!isConnected) return null;

  return (
    <div className="mx-auto max-w-6xl px-4 md:px-6 py-6 flex flex-col gap-5">
      {/* Page heading — mobile stacked, desktop side-by-side */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
            Dashboard
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage expenses and send XLM on Stellar Testnet
          </p>
        </div>
        <Button
          onClick={onSendClick}
          className="bg-stellar-teal text-primary-foreground hover:bg-stellar-teal/90 gap-2 w-full sm:w-auto"
        >
          <Wallet className="h-4 w-4" />
          Quick Send
        </Button>
      </div>

      {/* Transaction status banner */}
      <TxStatusBanner />

      {/* Main layout: single col on mobile, 3-col grid on lg */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left column */}
        <div className="flex flex-col gap-5">
          <WalletOverview onSendClick={onSendClick} />
          <ContractInfo />
          <ActivityFeed />
        </div>

        {/* Right column — expense splitter spans 2 cols on large screens */}
        <div className="lg:col-span-2">
          <ExpenseSplitter />
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [sendModalOpen, setSendModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <DivifyHeader onConnectClick={() => setWalletModalOpen(true)} />
      <main className="flex-1">
        <HeroSection onConnectClick={() => setWalletModalOpen(true)} />
        <Dashboard onSendClick={() => setSendModalOpen(true)} />
      </main>

      {/* Footer — stacked on mobile */}
      <footer className="border-t border-border px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center gap-3 sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-stellar-teal text-primary-foreground font-bold text-xs">
            D
          </div>
          <span className="text-sm text-muted-foreground">
            Divify — Stellar Journey to Mastery
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <a
            href="https://stellar.org"
            target="_blank"
            rel="noreferrer"
            className="hover:text-stellar-teal transition-colors"
          >
            Stellar.org
          </a>
          <a
            href="https://stellar.expert/explorer/testnet"
            target="_blank"
            rel="noreferrer"
            className="hover:text-stellar-teal transition-colors"
          >
            Explorer
          </a>
          <a
            href="https://www.freighter.app/"
            target="_blank"
            rel="noreferrer"
            className="hover:text-stellar-teal transition-colors"
          >
            Freighter
          </a>
        </div>
      </footer>

      {/* Modals */}
      <WalletSelectModal
        open={walletModalOpen}
        onClose={() => setWalletModalOpen(false)}
      />
      <SendPaymentModal
        open={sendModalOpen}
        onClose={() => setSendModalOpen(false)}
      />
    </div>
  );
}
