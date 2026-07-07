"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, X, Wallet, Split, Receipt, BarChart3, Gift } from "lucide-react";

interface GuidedTourProps {
  onComplete: () => void;
}

const TOUR_STEPS = [
  {
    title: "Welcome to Divify",
    description:
      "Divify is a non-custodial expense splitter built on Stellar. Split group bills, send XLM, and interact with smart contracts.",
    icon: Wallet,
  },
  {
    title: "Connect Your Wallet",
    description:
      "Click 'Connect Wallet' to link your Freighter, xBull, or Albedo wallet. All transactions are signed by you.",
    icon: Wallet,
  },
  {
    title: "Split Expenses",
    description:
      "Use the Expense Splitter to divide bills among friends. Add participants and pay everyone in one click.",
    icon: Split,
  },
  {
    title: "View Activity",
    description:
      "Check your transaction history in Activity Feed. Every expense and payment is recorded on-chain.",
    icon: Receipt,
  },
  {
    title: "Track Analytics",
    description:
      "See platform-wide stats including total users, XLM transacted, and your referral performance.",
    icon: BarChart3,
  },
  {
    title: "Invite Friends",
    description:
      "Share your referral code to invite friends. Help grow the Divify community on Stellar.",
    icon: Gift,
  },
];

export function GuidedTour({ onComplete }: GuidedTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const dismissed = localStorage.getItem("divify_tour_dismissed");
    if (dismissed === "true") {
      setVisible(false);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem("divify_tour_dismissed", "true");
    onComplete();
    setVisible(false);
  };

  if (!visible) return null;

  const step = TOUR_STEPS[currentStep];
  const Icon = step.icon;
  const progress = ((currentStep + 1) / TOUR_STEPS.length) * 100;

  return (
    <Card className="fixed bottom-4 right-4 w-80 z-50 shadow-lg border-stellar-teal/20">
      <div className="p-4 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-stellar-teal/10">
              <Icon className="h-4 w-4 text-stellar-teal" />
            </div>
            <h4 className="font-semibold text-sm">{step.title}</h4>
          </div>
          <button
            onClick={handleComplete}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed">
          {step.description}
        </p>

        <div className="space-y-3">
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-stellar-teal transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {currentStep + 1} of {TOUR_STEPS.length}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrev}
                disabled={currentStep === 0}
              >
                <ChevronLeft className="h-3 w-3 mr-1" />
                Back
              </Button>
              <Button
                size="sm"
                onClick={handleNext}
                className="bg-stellar-teal hover:bg-stellar-teal/90"
              >
                {currentStep === TOUR_STEPS.length - 1 ? "Finish" : "Next"}
                {currentStep < TOUR_STEPS.length - 1 && (
                  <ChevronRight className="h-3 w-3 ml-1" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
