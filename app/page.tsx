"use client";

import { useState, useEffect } from "react";
import { DivifyHeader } from "@/components/divify-header";
import { WalletOverview } from "@/components/wallet-overview";
import { ExpenseSplitter } from "@/components/expense-splitter";
import { ActivityFeed } from "@/components/activity-feed";
import { SendPaymentModal } from "@/components/send-payment-modal";
import { WalletSelectModal } from "@/components/wallet-select-modal";
import { TxStatusBanner } from "@/components/tx-status-banner";
import { ContractInfo } from "@/components/contract-info";
import { OnboardingModal } from "@/components/onboarding-modal";
import { FeedbackModal } from "@/components/feedback-modal";
import { AnalyticsDashboard } from "@/components/analytics-dashboard";
import { ReferralCard } from "@/components/referral-card";
import { GuidedTour } from "@/components/guided-tour";
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
  MessageSquare,
  UserPlus,
  TrendingUp,
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
        <Badge
          variant="outline"
          className="border-stellar-blue/40 text-stellar-blue px-3 py-1 text-xs font-medium"
        >
          Blue Belt
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
        <span>Stellar Journey to Mastery — Level 1 / 2 / 3 / 5</span>
      </div>
    </div>
  );
}

type DashboardTab = "overview" | "analytics" | "profile";

function Dashboard({
  onSendClick,
  onFeedbackClick,
  onOnboardingClick,
}: {
  onSendClick: () => void;
  onFeedbackClick: () => void;
  onOnboardingClick: () => void;
}) {
  const { isConnected } = useWallet();
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");

  if (!isConnected) return null;

  const tabs: { id: DashboardTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "overview", label: "Overview", icon: Split },
    { id: "analytics", label: "Analytics", icon: TrendingUp },
    { id: "profile", label: "Profile", icon: UserPlus },
  ];

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
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={onFeedbackClick}
            className="border-border gap-2 flex-1 sm:flex-none"
          >
            <MessageSquare className="h-4 w-4" />
            Feedback
          </Button>
          <Button
            onClick={onSendClick}
            className="bg-stellar-teal text-primary-foreground hover:bg-stellar-teal/90 gap-2 flex-1 sm:flex-none"
          >
            <Wallet className="h-4 w-4" />
            Quick Send
          </Button>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1 overflow-x-auto">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === id
                ? "bg-stellar-teal text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Transaction status banner */}
      <TxStatusBanner />

      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="flex flex-col gap-5">
            <WalletOverview onSendClick={onSendClick} />
            <ContractInfo />
            <ActivityFeed />
          </div>
          <div className="lg:col-span-2">
            <ExpenseSplitter />
          </div>
        </div>
      )}

      {activeTab === "analytics" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2">
            <AnalyticsDashboard />
          </div>
          <div className="flex flex-col gap-5">
            <ReferralCard />
            <ContractInfo />
          </div>
        </div>
      )}

      {activeTab === "profile" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="flex flex-col gap-5">
            <ReferralCard />
            <WalletOverview onSendClick={onSendClick} />
          </div>
          <div className="lg:col-span-2 flex flex-col gap-5">
            <div className="rounded-lg border border-stellar-teal/20 bg-stellar-teal/5 p-4">
              <div className="flex items-center gap-2 mb-2">
                <UserPlus className="h-5 w-5 text-stellar-teal" />
                <h3 className="text-base font-semibold text-foreground">
                  Profile & Onboarding
                </h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Complete your profile to join the Divify community, get your
                referral code, and help us improve with feedback.
              </p>
              <Button
                onClick={onOnboardingClick}
                className="bg-stellar-teal text-primary-foreground hover:bg-stellar-teal/90 gap-2"
              >
                <UserPlus className="h-4 w-4" />
                Edit Profile
              </Button>
            </div>
            <AnalyticsDashboard />
          </div>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [onboardingModalOpen, setOnboardingModalOpen] = useState(false);

  // Check for referral code in URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) {
      localStorage.setItem("divify_pending_referral", ref);
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <DivifyHeader onConnectClick={() => setWalletModalOpen(true)} />
      <main className="flex-1">
        <HeroSection onConnectClick={() => setWalletModalOpen(true)} />
        <Dashboard
          onSendClick={() => setSendModalOpen(true)}
          onFeedbackClick={() => setFeedbackModalOpen(true)}
          onOnboardingClick={() => setOnboardingModalOpen(true)}
        />
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

      {/* Guided tour for new users */}
      <GuidedTour />

      {/* Modals */}
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
      <OnboardingModal
        open={onboardingModalOpen}
        onClose={() => setOnboardingModalOpen(false)}
      />
    </div>
  );
}
