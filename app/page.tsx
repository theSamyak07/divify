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
import { useWallet } from "@/lib/wallet-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Wallet,
  Split,
  Zap,
  Globe,
  Shield,
  ChevronRight,
  Loader2,
  FileCode2,
  LayoutDashboard,
  BarChart3,
  User,
  MessageSquare,
  Settings,
} from "lucide-react";
import { useSearchParams } from "next/navigation";

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
          className="border-blue-500/40 text-blue-500 px-3 py-1 text-xs font-medium bg-blue-500/10"
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
        <span>Stellar Journey to Mastery — Level 5 Blue Belt</span>
      </div>
    </div>
  );
}

function DashboardTabs({
  activeTab,
  onTabChange,
  onFeedbackClick,
  onOnboardingClick,
}: {
  activeTab: "overview" | "analytics" | "profile";
  onTabChange: (tab: "overview" | "analytics" | "profile") => void;
  onFeedbackClick: () => void;
  onOnboardingClick: () => void;
}) {
  const tabs = [
    { id: "overview" as const, label: "Overview", icon: LayoutDashboard },
    { id: "analytics" as const, label: "Analytics", icon: BarChart3 },
    { id: "profile" as const, label: "Profile", icon: User },
  ];

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1 p-1 bg-secondary/50 rounded-lg">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              activeTab === id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={onFeedbackClick}
        className="gap-2"
      >
        <MessageSquare className="h-4 w-4" />
        Feedback
      </Button>
    </div>
  );
}

function ProfileTab({
  onOnboardingClick,
}: {
  onOnboardingClick: () => void;
}) {
  const { publicKey, disconnectWallet } = useWallet();
  const [profile, setProfile] = useState<{
    name: string;
    email: string;
    referral_code: string;
    joined_at: string;
  } | null>(null);

  useEffect(() => {
    if (publicKey) {
      fetchProfile();
    }
  }, [publicKey]);

  async function fetchProfile() {
    if (!publicKey) return;
    try {
      const { data } = await supabase
        .from("user_profiles")
        .select("name, email, referral_code, joined_at")
        .eq("wallet_address", publicKey)
        .single();
      setProfile(data);
    } catch {
      setProfile(null);
    }
  }

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader className="pb-2 pt-3 px-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <User className="h-4 w-4 text-stellar-teal" />
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-3 px-3 space-y-3">
          {profile ? (
            <>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Name</p>
                <p className="text-sm font-medium">{profile.name}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-medium">{profile.email}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Member Since</p>
                <p className="text-sm font-medium">
                  {new Date(profile.joined_at).toLocaleDateString()}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={onOnboardingClick}
                className="w-full mt-2"
              >
                Edit Profile
              </Button>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Complete your profile to unlock referrals and personalized features.
              </p>
              <Button
                onClick={onOnboardingClick}
                className="w-full bg-stellar-teal text-primary-foreground"
              >
                Complete Setup
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <ReferralCard />

      <Card>
        <CardHeader className="pb-2 pt-3 px-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Settings className="h-4 w-4 text-stellar-teal" />
            Wallet Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-3 px-3">
          <div className="space-y-1 mb-3">
            <p className="text-xs text-muted-foreground">Wallet Address</p>
            <p className="text-xs font-mono break-all">{publicKey}</p>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={disconnectWallet}
            className="w-full"
          >
            Disconnect Wallet
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

import { supabase } from "@/lib/supabase";

function DashboardContent({
  activeTab,
  onSendClick,
  onFeedbackClick,
  onOnboardingClick,
}: {
  activeTab: "overview" | "analytics" | "profile";
  onSendClick: () => void;
  onFeedbackClick: () => void;
  onOnboardingClick: () => void;
}) {
  if (activeTab === "analytics") {
    return <AnalyticsDashboard />;
  }

  if (activeTab === "profile") {
    return <ProfileTab onOnboardingClick={onOnboardingClick} />;
  }

  return (
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
  );
}

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
  const [activeTab, setActiveTab] = useState<"overview" | "analytics" | "profile">("overview");

  if (!isConnected) return null;

  return (
    <div className="mx-auto max-w-6xl px-4 md:px-6 py-6 flex flex-col gap-5">
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

      <TxStatusBanner />

      <DashboardTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onFeedbackClick={onFeedbackClick}
        onOnboardingClick={onOnboardingClick}
      />

      <DashboardContent
        activeTab={activeTab}
        onSendClick={onSendClick}
        onFeedbackClick={onFeedbackClick}
        onOnboardingClick={onOnboardingClick}
      />
    </div>
  );
}

function HomePageContent() {
  const searchParams = useSearchParams();
  const referralCode = searchParams.get("ref");

  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [onboardingModalOpen, setOnboardingModalOpen] = useState(false);
  const [tourCompleted, setTourCompleted] = useState(false);

  const { isConnected, publicKey } = useWallet();

  useEffect(() => {
    if (referralCode && isConnected) {
      setOnboardingModalOpen(true);
    }
  }, [referralCode, isConnected]);

  useEffect(() => {
    if (isConnected && publicKey) {
      supabase
        .from("user_profiles")
        .select("wallet_address")
        .eq("wallet_address", publicKey)
        .single()
        .then(({ data }) => {
          if (!data) {
            setOnboardingModalOpen(true);
          }
        });
    }
  }, [isConnected, publicKey]);

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

      <footer className="border-t border-border px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center gap-3 sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-stellar-teal text-primary-foreground font-bold text-xs">
            D
          </div>
          <span className="text-sm text-muted-foreground">
            Divify — Stellar Journey to Mastery — Level 5 Blue Belt
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
        initialReferralCode={referralCode}
      />

      {!tourCompleted && (
        <GuidedTour onComplete={() => setTourCompleted(true)} />
      )}
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <HomePageContent />
    </Suspense>
  );
}
