"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ChevronRight,
  ChevronLeft,
  X,
  Sparkles,
  Wallet,
  Split,
  Send,
  Activity,
  Gift,
} from "lucide-react";

interface TourStep {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    title: "Welcome to Divify!",
    description:
      "Divify is a non-custodial expense splitter built on Stellar. Split group bills in USD or XLM, pay friends instantly on-chain, and track everything in real-time.",
    icon: Sparkles,
    color: "text-stellar-teal",
  },
  {
    title: "Connect Your Wallet",
    description:
      "Click 'Connect Wallet' to link your Freighter, xBull, or Albedo wallet. All transactions are signed by you — Divify never holds your keys.",
    icon: Wallet,
    color: "text-stellar-teal",
  },
  {
    title: "Split Expenses",
    description:
      "Enter a total amount in USD or XLM, add participants, and we'll calculate everyone's share. Convert USD to XLM automatically at current rates.",
    icon: Split,
    color: "text-stellar-blue",
  },
  {
    title: "Send Payments Instantly",
    description:
      "Pay participants directly with XLM. Transactions settle in seconds on Stellar Testnet — no banks, no delays, no intermediaries.",
    icon: Send,
    color: "text-stellar-green",
  },
  {
    title: "Track Activity",
    description:
      "View your transaction history and contract events in real-time. Every payment is verifiable on the Stellar Explorer.",
    icon: Activity,
    color: "text-stellar-amber",
  },
  {
    title: "Earn Referrals",
    description:
      "Complete your profile to get a referral code. Share it with friends to grow the Divify community and track your impact.",
    icon: Gift,
    color: "text-stellar-green",
  },
];

const STORAGE_KEY = "divify_tour_completed";

export function GuidedTour() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const completed = localStorage.getItem(STORAGE_KEY);
    if (!completed) {
      const timer = setTimeout(() => setOpen(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setOpen(false);
    localStorage.setItem(STORAGE_KEY, "true");
  };

  const handleNext = () => {
    if (step < TOUR_STEPS.length - 1) {
      setStep(step + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleSkip = () => {
    handleClose();
  };

  if (!open) return null;

  const current = TOUR_STEPS[step];
  const Icon = current.icon;
  const isLast = step === TOUR_STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <Card className="w-full max-w-md bg-card border-border shadow-xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-stellar-teal/10">
              <Icon className={`h-4 w-4 ${current.color}`} />
            </div>
            <span className="text-sm text-muted-foreground">
              Step {step + 1} of {TOUR_STEPS.length}
            </span>
          </div>
          <button
            onClick={handleSkip}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Skip tour"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6">
          <h3 className="text-xl font-bold text-foreground mb-2">
            {current.title}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {current.description}
          </p>
        </div>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-1.5 pb-4">
          {TOUR_STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === step
                  ? "w-6 bg-stellar-teal"
                  : i < step
                  ? "w-1.5 bg-stellar-teal/50"
                  : "w-1.5 bg-border"
              }`}
            />
          ))}
        </div>

        <div className="flex items-center justify-between p-4 border-t border-border">
          <Button
            variant="ghost"
            onClick={handleSkip}
            className="text-muted-foreground hover:text-foreground"
          >
            Skip Tour
          </Button>
          <div className="flex items-center gap-2">
            {step > 0 && (
              <Button
                variant="outline"
                onClick={handlePrev}
                className="border-border gap-1.5"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </Button>
            )}
            <Button
              onClick={handleNext}
              className="bg-stellar-teal text-primary-foreground hover:bg-stellar-teal/90 gap-1.5"
            >
              {isLast ? "Get Started" : "Next"}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
