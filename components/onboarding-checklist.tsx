"use client";

import { useState, useEffect, useCallback } from "react";
import { useWallet } from "@/lib/wallet-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Circle,
  Wallet,
  Coins,
  Split,
  MessageSquare,
  Share2,
  Zap,
} from "lucide-react";
import {
  getUserProfile,
  hasSubmittedFeedback,
} from "@/lib/local-storage";

interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  done: boolean;
}

export function OnboardingChecklist() {
  const { isConnected, publicKey, xlmBalance } = useWallet();
  const [hasFeedback, setHasFeedback] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const [hasReferral, setHasReferral] = useState(false);

  const checkProgress = useCallback(() => {
    if (!publicKey) return;
    const profile = getUserProfile(publicKey);
    setHasProfile(!!profile?.name);
    setHasFeedback(hasSubmittedFeedback(publicKey));
    // Check if user has shared referral (any referral recorded in any key)
    const code = profile?.referral_code ?? "";
    const referrals = JSON.parse(
      localStorage.getItem(`divify_referrals_${code}`) ?? "[]"
    );
    setHasReferral(referrals.length > 0);
  }, [publicKey]);

  useEffect(() => {
    checkProgress();
    // Re-check periodically
    const interval = setInterval(checkProgress, 5000);
    return () => clearInterval(interval);
  }, [checkProgress]);

  const hasXlm = parseFloat(xlmBalance) > 0;

  const items: ChecklistItem[] = [
    {
      id: "connect",
      label: "Connect Wallet",
      description: "Link your Freighter, xBull, or Albedo wallet",
      icon: Wallet,
      done: isConnected,
    },
    {
      id: "funds",
      label: "Fund with Friendbot",
      description: "Get free testnet XLM from Friendbot",
      icon: Coins,
      done: hasXlm,
    },
    {
      id: "profile",
      label: "Set Up Profile",
      description: "Add your name and email to your profile",
      icon: Zap,
      done: hasProfile,
    },
    {
      id: "expense",
      label: "Create an Expense",
      description: "Split a group expense via the Expense Splitter",
      icon: Split,
      done: false, // Tracked via contract events
    },
    {
      id: "feedback",
      label: "Submit Feedback",
      description: "Rate your experience and help us improve",
      icon: MessageSquare,
      done: hasFeedback,
    },
    {
      id: "referral",
      label: "Invite a Friend",
      description: "Share your referral code to grow the community",
      icon: Share2,
      done: hasReferral,
    },
  ];

  const completedCount = items.filter((i) => i.done).length;
  const percentage = Math.round((completedCount / items.length) * 100);

  if (!isConnected) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold">
            Getting Started
          </CardTitle>
          <Badge
            variant={percentage === 100 ? "default" : "secondary"}
            className="gap-1"
          >
            {completedCount}/{items.length}
          </Badge>
        </div>
        {/* Progress bar */}
        <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-stellar-teal transition-all duration-500 rounded-full"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className={`flex items-start gap-3 rounded-lg p-2 transition-colors ${
                item.done ? "opacity-60" : "hover:bg-accent/50"
              }`}
            >
              {item.done ? (
                <CheckCircle2 className="h-4 w-4 text-stellar-teal shrink-0 mt-0.5" />
              ) : (
                <Circle className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                  <p
                    className={`text-xs font-medium ${
                      item.done
                        ? "line-through text-muted-foreground"
                        : "text-foreground"
                    }`}
                  >
                    {item.label}
                  </p>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
