"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Wallet, Split, Send, Activity, Users, X } from "lucide-react";

interface GuidedTourProps {
  onComplete: () => void;
}

const TOUR_STEPS = [
  {
    title: "Welcome to Divify",
    description: "The smart way to split expenses and send payments on Stellar. Let us show you around!",
    icon: Wallet,
  },
  {
    title: "Connect Your Wallet",
    description: "Click 'Connect Wallet' to link your Freighter, xBull, or Albedo wallet and start transacting.",
    icon: Wallet,
  },
  {
    title: "Split Expenses",
    description: "Add participants and amounts to split any bill. Divify calculates shares automatically.",
    icon: Split,
  },
  {
    title: "Send Payments",
    description: "Use Quick Send to transfer XLM to any Stellar address instantly with real-time confirmation.",
    icon: Send,
  },
  {
    title: "Track Activity",
    description: "Monitor your transaction history and expense splits in the Activity Feed.",
    icon: Activity,
  },
  {
    title: "Earn Referrals",
    description: "Share your referral code to invite friends and grow the Divify community!",
    icon: Users,
  },
];

const TOUR_COMPLETED_KEY = "divify_tour_completed";

export function GuidedTour({ onComplete }: GuidedTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem(TOUR_COMPLETED_KEY);
    if (!completed) {
      setVisible(true);
    }
  }, []);

  function handleNext() {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      handleComplete();
    }
  }

  function handleBack() {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
    }
  }

  function handleSkip() {
    handleComplete();
  }

  function handleComplete() {
    localStorage.setItem(TOUR_COMPLETED_KEY, "true");
    setVisible(false);
    onComplete();
  }

  if (!visible) return null;

  const step = TOUR_STEPS[currentStep];
  const Icon = step.icon;
  const isLastStep = currentStep === TOUR_STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="relative w-full max-w-md mx-4 p-6 bg-card border-border shadow-xl">
        <button
          onClick={handleSkip}
          className="absolute top-3 right-3 p-1 rounded-full hover:bg-secondary transition-colors"
          aria-label="Skip tour"
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </button>

        <div className="flex flex-col items-center text-center space-y-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-stellar-teal/10">
            <Icon className="h-7 w-7 text-stellar-teal" />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold">{step.title}</h3>
            <p className="text-sm text-sm text-muted-foreground">{step.description}</p>
          </div>

          <div className="flex items-center justify-center gap-1.5 pt-2">
            {TOUR_STEPS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentStep(idx)}
                className={`h-2 w-2 rounded-full transition-colors ${
                  idx === currentStep
                    ? "bg-stellar-teal"
                    : "bg-muted hover:bg-muted-foreground/50"
                }`}
                aria-label={`Go to step ${idx + 1}`}
              />
            ))}
          </div>

          <div className="flex justify-between w-full pt-4">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0}
              className="w-24"
            >
              Back
            </Button>
            <Button
              onClick={handleNext}
              className="w-24 bg-stellar-teal text-primary-foreground hover:bg-stellar-teal/90"
            >
              {isLastStep ? "Get Started" : "Next"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
