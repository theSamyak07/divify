"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@/lib/wallet-context";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle, Users, Wallet } from "lucide-react";
import {
  upsertUserProfile,
  markUserOnboarded,
  recordReferral,
  generateReferralCode,
} from "@/lib/local-storage";

interface OnboardingModalProps {
  open: boolean;
  onClose: () => void;
  referralCode?: string;
}

export function OnboardingModal({
  open,
  onClose,
  referralCode,
}: OnboardingModalProps) {
  const { publicKey } = useWallet();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [userReferralCode, setUserReferralCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);

  // Pre-fill referral code from URL param
  useEffect(() => {
    if (referralCode) setUserReferralCode(referralCode);
  }, [referralCode]);

  const handleSubmit = async () => {
    if (!publicKey) return;

    setSubmitting(true);

    // Save profile to localStorage
    upsertUserProfile({
      wallet_address: publicKey,
      name,
      email,
      referred_by: referralCode || userReferralCode || null,
    });

    // Record referral if a code was used
    const codeUsed = referralCode || userReferralCode;
    if (codeUsed) {
      recordReferral(codeUsed, publicKey);
    }

    // Mark onboarded
    markUserOnboarded(publicKey);

    setSubmitting(false);
    setCompleted(true);
  };

  const handleClose = () => {
    setName("");
    setEmail("");
    setUserReferralCode("");
    setCompleted(false);
    onClose();
  };

  if (completed) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center py-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-stellar-teal/10 mb-4">
              <CheckCircle className="h-10 w-10 text-stellar-teal" />
            </div>
            <h3 className="text-lg font-semibold">Welcome to Divify! 🎉</h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-xs">
              Your profile is set up. Start splitting expenses on Stellar Testnet.
            </p>
            {publicKey && (
              <div className="mt-3 rounded-lg bg-muted px-4 py-2 text-xs font-mono text-muted-foreground">
                Your referral code:{" "}
                <span className="font-bold text-foreground">
                  {generateReferralCode(publicKey)}
                </span>
              </div>
            )}
            <Button
              onClick={handleClose}
              className="mt-5 bg-stellar-teal hover:bg-stellar-teal/90 gap-2"
            >
              <Wallet className="h-4 w-4" />
              Get Started
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-stellar-teal/10">
              <Users className="h-4 w-4 text-stellar-teal" />
            </div>
            <DialogTitle>Complete Your Profile</DialogTitle>
          </div>
          <DialogDescription>
            Set up your profile to get the most out of Divify. All data is stored locally.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="onboard-name">Name (optional)</Label>
            <Input
              id="onboard-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="onboard-email">Email (optional)</Label>
            <Input
              id="onboard-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
            />
          </div>

          {!referralCode && (
            <div className="space-y-2">
              <Label htmlFor="onboard-referral">Referral Code (optional)</Label>
              <Input
                id="onboard-referral"
                value={userReferralCode}
                onChange={(e) =>
                  setUserReferralCode(e.target.value.toUpperCase())
                }
                placeholder="Enter referral code"
                maxLength={7}
              />
              <p className="text-xs text-muted-foreground">
                Have a referral code from a friend? Enter it here.
              </p>
            </div>
          )}

          {referralCode && (
            <div className="rounded-md bg-stellar-teal/5 border border-stellar-teal/20 p-3">
              <p className="text-xs text-muted-foreground">
                You were referred with code:{" "}
                <span className="font-mono font-semibold text-stellar-teal">
                  {referralCode}
                </span>
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleClose}>
            Skip
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || !publicKey}
            className="bg-stellar-teal hover:bg-stellar-teal/90"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Complete Setup"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
