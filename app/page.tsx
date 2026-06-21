"use client";

import { useState } from "react";
import { DivifyHeader } from "@/components/divify-header";
import { WalletOverview } from "@/components/wallet-overview";
import { ExpenseSplitter } from "@/components/expense-splitter";
import { ActivityFeed } from "@/components/activity-feed";
import { SendPaymentModal } from "@/components/send-payment-modal";
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
} from "lucide-react";

function HeroSection() {
  const { isConnected, connectWallet, isLoading } = useWallet();

  if (isConnected) return null;

  return (
    <div className="flex flex-col items-center justify-center text-center px-6 py-16 md:py-24 max-w-3xl mx-auto">
      <Badge
        variant="outline"
        className="mb-6 border-stellar-teal/30 text-stellar-teal px-3 py-1 text-xs font-medium"
      >
        Stellar Journey to Mastery — White Belt Submission
      </Badge>
      <h1 className="text-4xl md:text-6xl font-bold text-foreground tracking-tight text-balance mb-4">
        Split expenses.{" "}
        <span className="text-stellar-teal">Pay instantly.</span>
      </h1>
      <p className="text-lg text-muted-foreground text-pretty max-w-xl mb-8 leading-relaxed">
        Divify is a smart expense splitter built on the Stellar network. Split
        group bills and send XLM payments directly — no banks, no delays, no
        trust required.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-3 mb-12">
        <Button
          onClick={connectWallet}
          disabled={isLoading}
          size="lg"
          className="bg-stellar-teal text-primary-foreground hover:bg-stellar-teal/90 gap-2 px-8"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Wallet className="h-5 w-5" />
          )}
          {isLoading ? "Connecting..." : "Connect Freighter Wallet"}
        </Button>
        <a href="https://www.freighter.app/" target="_blank" rel="noreferrer">
          <Button
            variant="outline"
            size="lg"
            className="border-border text-foreground gap-2"
          >
            Get Freighter
            <ChevronRight className="h-4 w-4" />
          </Button>
        </a>
      </div>

      {/* Feature highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl">
        {[
          {
            icon: Split,
            title: "Multi-Currency Split",
            desc: "Split in USD or XLM, we handle the conversion.",
          },
          {
            icon: Zap,
            title: "Instant Payments",
            desc: "Send XLM to multiple people in seconds on Stellar.",
          },
          {
            icon: Shield,
            title: "Non-Custodial",
            desc: "Your keys, your funds. Freighter never leaves your device.",
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

      <div className="mt-10 flex items-center gap-2 text-xs text-muted-foreground">
        <Globe className="h-3.5 w-3.5" />
        <span>Running on Stellar Testnet</span>
        <span className="text-border">·</span>
        <span>Built for Stellar Journey to Mastery</span>
      </div>
    </div>
  );
}

function Dashboard() {
  const { isConnected } = useWallet();
  const [sendModalOpen, setSendModalOpen] = useState(false);

  if (!isConnected) return null;

  return (
    <div className="mx-auto max-w-6xl px-4 md:px-6 py-8 flex flex-col gap-6">
      {/* Page heading */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground tracking-tight">
            Dashboard
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage your expenses and send XLM on Stellar Testnet
          </p>
        </div>
        <Button
          onClick={() => setSendModalOpen(true)}
          className="bg-stellar-teal text-primary-foreground hover:bg-stellar-teal/90 gap-2"
        >
          <Wallet className="h-4 w-4" />
          Quick Send
        </Button>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="flex flex-col gap-6">
          <WalletOverview onSendClick={() => setSendModalOpen(true)} />
          <ActivityFeed />
        </div>

        {/* Right column — expense splitter takes 2 cols */}
        <div className="lg:col-span-2">
          <ExpenseSplitter />
        </div>
      </div>

      <SendPaymentModal
        open={sendModalOpen}
        onClose={() => setSendModalOpen(false)}
      />
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <DivifyHeader />
      <main className="flex-1">
        <HeroSection />
        <Dashboard />
      </main>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-4 flex items-center justify-between">
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
    </div>
  );
}
