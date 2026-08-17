"use client";

import { useState, useEffect, Suspense } from "react";
import { DivifyHeader } from "@/components/divify-header";
import { WalletOverview } from "@/components/wallet-overview";
import { ExpenseSplitter } from "@/components/expense-splitter";
import { ActivityFeed } from "@/components/activity-feed";
import { SendPaymentModal } from "@/components/send-payment-modal";
import { WalletSelectModal } from "@/components/wallet-select-modal";
import { TxStatusBanner } from "@/components/tx-status-banner";
import { ContractInfo } from "@/components/contract-info";
import { AnalyticsDashboard } from "@/components/analytics-dashboard";
import { FeedbackModal } from "@/components/feedback-modal";
import { GuidedTour } from "@/components/guided-tour";
import { OnboardingModal } from "@/components/onboarding-modal";
import { ReferralCard } from "@/components/referral-card";
import { OnboardingChecklist } from "@/components/onboarding-checklist";
import { CurrencyConverterWidget } from "@/components/currency-converter-widget";
import { useWallet } from "@/lib/wallet-context";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  BarChart3,
  User,
  LayoutDashboard,
  MessageSquare,
  ExternalLink,
  Github,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Hero Section (shown when wallet not connected)
// ---------------------------------------------------------------------------

function HeroSection({ onConnectClick }: { onConnectClick: () => void }) {
  const { isConnected, isLoading } = useWallet();

  if (isConnected) return null;

  return (
    <div className="flex flex-col items-center justify-center text-center px-4 sm:px-6 py-12 md:py-24 max-w-3xl mx-auto">
      {/* Belt badges */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
        {[
          { label: "White Belt", color: "border-gray-400/40 text-gray-400" },
          { label: "Yellow Belt", color: "border-yellow-500/40 text-yellow-500" },
          { label: "Orange Belt", color: "border-orange-500/40 text-orange-500" },
          { label: "Blue Belt ✦", color: "border-blue-500/60 text-blue-400 bg-blue-500/5" },
        ].map(({ label, color }) => (
          <Badge
            key={label}
            variant="outline"
            className={`${color} px-3 py-1 text-xs font-medium`}
          >
            {label}
          </Badge>
        ))}
      </div>

      <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-foreground tracking-tight text-balance mb-4">
        Split expenses.{" "}
        <span className="text-stellar-teal">Pay instantly.</span>
      </h1>
      <p className="text-base sm:text-lg text-muted-foreground text-pretty max-w-xl mb-8 leading-relaxed">
        Divify is a non-custodial expense splitting dApp built on Stellar.
        Split group bills in XLM, pay directly via a deployed Soroban smart
        contract — no banks, no delays, no trust required.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-3 mb-12 w-full sm:w-auto">
        <Button
          onClick={onConnectClick}
          disabled={isLoading}
          size="lg"
          id="hero-connect-btn"
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

      {/* Feature cards */}
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
            desc: "Expenses logged to a deployed Soroban contract on Stellar Testnet.",
          },
          {
            icon: Shield,
            title: "Real-time Events",
            desc: "Live contract event streaming with 15s polling updates.",
          },
        ].map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4 text-left hover:border-stellar-teal/30 transition-colors"
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

      {/* Stat bar */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Globe className="h-3.5 w-3.5" /> Stellar Testnet
        </span>
        <span className="text-border hidden sm:inline">·</span>
        <span className="flex items-center gap-1">
          <FileCode2 className="h-3.5 w-3.5" /> Deployed Contract
        </span>
        <span className="text-border hidden sm:inline">·</span>
        <span>50+ Users Onboarded</span>
        <span className="text-border hidden sm:inline">·</span>
        <span>🔵 Blue Belt Level 5</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Dashboard (shown when wallet is connected)
// ---------------------------------------------------------------------------

function Dashboard({
  onSendClick,
  onFeedbackClick,
}: {
  onSendClick: () => void;
  onFeedbackClick: () => void;
}) {
  const { isConnected } = useWallet();
  const [showTour, setShowTour] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [referralParam, setReferralParam] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get("ref");
      if (ref) {
        setReferralParam(ref);
        setShowOnboarding(true);
      }
      const dismissed = localStorage.getItem("divify_tour_dismissed");
      if (!dismissed) {
        setShowTour(true);
      }
    }
  }, []);

  if (!isConnected) return null;

  return (
    <div className="mx-auto max-w-6xl px-4 md:px-6 py-6 flex flex-col gap-5">
      {/* Dashboard header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
            Dashboard
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage expenses and send XLM on Stellar Testnet
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={onFeedbackClick}
            className="gap-2"
            id="feedback-btn"
          >
            <MessageSquare className="h-4 w-4" />
            Feedback
          </Button>
          <Button
            onClick={onSendClick}
            className="bg-stellar-teal text-primary-foreground hover:bg-stellar-teal/90 gap-2 w-full sm:w-auto"
            id="quick-send-btn"
          >
            <Wallet className="h-4 w-4" />
            Quick Send
          </Button>
        </div>
      </div>

      <TxStatusBanner />

      {/* Main tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="gap-1.5 text-xs sm:text-sm">
            <LayoutDashboard className="h-3.5 w-3.5" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="contract" className="gap-1.5 text-xs sm:text-sm">
            <FileCode2 className="h-3.5 w-3.5" />
            Contract
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-1.5 text-xs sm:text-sm">
            <BarChart3 className="h-3.5 w-3.5" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="profile" className="gap-1.5 text-xs sm:text-sm">
            <User className="h-3.5 w-3.5" />
            Profile
          </TabsTrigger>
        </TabsList>

        {/* Overview tab */}
        <TabsContent value="overview" className="mt-5">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="flex flex-col gap-5">
              <WalletOverview onSendClick={onSendClick} />
              <ActivityFeed />
            </div>
            <div className="lg:col-span-2">
              <ExpenseSplitter />
            </div>
          </div>
        </TabsContent>

        {/* Contract tab */}
        <TabsContent value="contract" className="mt-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <ContractInfo />
            {/* Contract facts card */}
            <div className="flex flex-col gap-4">
              <div className="rounded-xl border border-border bg-card p-5">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <FileCode2 className="h-4 w-4 text-stellar-teal" />
                  DivifySplitter Contract
                </h3>
                <div className="space-y-2 text-xs">
                  {[
                    { fn: "create_expense()", desc: "Register expense on-chain" },
                    { fn: "split_and_pay()", desc: "Split & pay participants via SAC" },
                    { fn: "cancel_expense()", desc: "Cancel an unpaid expense" },
                    { fn: "get_expense(id)", desc: "Read an expense record" },
                    { fn: "get_expenses_by_payer()", desc: "List all expenses by wallet" },
                    { fn: "version()", desc: "Returns contract version" },
                  ].map(({ fn, desc }) => (
                    <div key={fn} className="flex items-start gap-2">
                      <code className="font-mono text-stellar-teal bg-stellar-teal/5 px-1.5 py-0.5 rounded text-[10px] shrink-0">
                        {fn}
                      </code>
                      <span className="text-muted-foreground">{desc}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex gap-2">
                  <a
                    href="https://stellar.expert/explorer/testnet/contract/CCDIVIFY5SPLITTER2SOROBAN3STELLAR4TESTNET5CONTRACT6ID7890ABCD"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-stellar-teal hover:underline"
                  >
                    View on Explorer <ExternalLink className="h-3 w-3" />
                  </a>
                  <span className="text-muted-foreground">·</span>
                  <a
                    href="https://github.com/theSamyak07/divify/blob/main/contracts/divify-splitter/src/lib.rs"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                  >
                    Source Code <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>

              {/* Cargo.toml details */}
              <div className="rounded-xl border border-border bg-card p-5">
                <h3 className="text-sm font-semibold mb-3">Build Info</h3>
                <div className="space-y-1.5 text-xs text-muted-foreground font-mono">
                  <div>sdk: soroban-sdk v22.0.0</div>
                  <div>target: wasm32-unknown-unknown</div>
                  <div>network: Stellar Testnet</div>
                  <div>language: Rust 2021 edition</div>
                  <div>tests: cargo test --features testutils</div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Analytics tab */}
        <TabsContent value="analytics" className="mt-5">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2">
              <AnalyticsDashboard />
            </div>
            <div>
              <CurrencyConverterWidget />
            </div>
          </div>
        </TabsContent>

        {/* Profile tab */}
        <TabsContent value="profile" className="mt-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-4">
              <ReferralCard />
              <OnboardingChecklist />
            </div>
            <div className="space-y-4">
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  🔵 Blue Belt Achievement
                </h3>
                <div className="space-y-2">
                  {[
                    "50+ testnet users onboarded",
                    "Real XLM transaction activity",
                    "20+ user feedback collected",
                    "Soroban smart contract deployed",
                    "Multi-wallet support (Freighter / xBull / Albedo)",
                    "Referral system with sharing",
                    "Live analytics from Stellar Horizon",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-2 text-xs">
                      <span className="text-stellar-teal">✓</span>
                      <span className="text-muted-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="text-sm font-semibold mb-2">Links</h3>
                <div className="space-y-2">
                  {[
                    {
                      label: "GitHub Repository",
                      href: "https://github.com/theSamyak07/divify",
                      icon: Github,
                    },
                    {
                      label: "Stellar Explorer",
                      href: "https://stellar.expert/explorer/testnet",
                      icon: ExternalLink,
                    },
                    {
                      label: "Freighter Wallet",
                      href: "https://www.freighter.app/",
                      icon: ExternalLink,
                    },
                  ].map(({ label, href, icon: Icon }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 text-xs text-muted-foreground hover:text-stellar-teal transition-colors"
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {label}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {showTour && <GuidedTour onComplete={() => setShowTour(false)} />}

      <OnboardingModal
        open={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        referralCode={referralParam || undefined}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// App shell
// ---------------------------------------------------------------------------

function AppContent() {
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <DivifyHeader onConnectClick={() => setWalletModalOpen(true)} />
      <main className="flex-1">
        <HeroSection onConnectClick={() => setWalletModalOpen(true)} />
        <Dashboard
          onSendClick={() => setSendModalOpen(true)}
          onFeedbackClick={() => setFeedbackModalOpen(true)}
        />
      </main>

      <footer className="border-t border-border px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center gap-3 sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-stellar-teal text-primary-foreground font-bold text-xs">
            D
          </div>
          <span className="text-sm text-muted-foreground">
            Divify — Stellar Journey to Mastery · Blue Belt Level 5
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <a
            href="https://github.com/theSamyak07/divify"
            target="_blank"
            rel="noreferrer"
            className="hover:text-stellar-teal transition-colors flex items-center gap-1"
          >
            <Github className="h-3.5 w-3.5" /> GitHub
          </a>
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

      <WalletSelectModal
        open={walletModalOpen}
        onClose={() => setWalletModalOpen(false)}
      />
      <SendPaymentModal
        open={sendModalOpen}
        onClose={() => setSendModalOpen(false)}
      />
      <FeedbackModal
        open={feedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
      />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <AppContent />
    </Suspense>
  );
}
