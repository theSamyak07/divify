"use client";

import { useState } from "react";
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
import { Loader2, CheckCircle } from "lucide-react";
import { upsertUserProfile, markUserOnboarded, saveReferral } from "@/lib/supabase";

interface OnboardingModalProps {
  open: boolean;
  onClose: () => void;
  referralCode?: string;
}

export function OnboardingModal({ open, onClose, referralCode }: OnboardingModalProps) {
  const { address } = useWallet();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [userReferralCode, setUserReferralCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);

  const handleSubmit = async () => {
    if (!address) return;

    setSubmitting(true);

    const { error: profileError } = await upsertUserProfile({
      wallet_address: address,
      name,
      email,
    });

    if (profileError) {
      console.error("Profile error:", profileError);
    }

    if (referralCode || userReferralCode) {
      const code = referralCode || userReferralCode;
      const { error: referralError } = await saveReferral(
        code,
        address,
        code
      );

      if (referralError) {
        console.error("Referral error:", referralError);
      }
    }

    const { error: onboardError } = await markUserOnboarded(address);

    setSubmitting(false);
    if (!onboardError) {
      setCompleted(true);
    }
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
            <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
            <h3 className="text-lg font-semibold">Welcome to Divify!</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Your profile has been set up. You can now start splitting expenses.
            </p>
            <Button onClick={handleClose} className="mt-4 bg-stellar-teal hover:bg-stellar-teal/90">
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
          <DialogTitle>Complete Your Profile</DialogTitle>
          <DialogDescription>
            Set up your profile to get the most out of Divify.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name (optional)</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email (optional)</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
            />
          </div>

          {!referralCode && (
            <div className="space-y-2">
              <Label htmlFor="referral">Referral Code (optional)</Label>
              <Input
                id="referral"
                value={userReferralCode}
                onChange={(e) => setUserReferralCode(e.target.value.toUpperCase())}
                placeholder="Enter referral code"
                maxLength={6}
              />
              <p className="text-xs text-muted-foreground">
                Have a referral code from a friend? Enter it here.
              </p>
            </div>
          )}

          {referralCode && (
            <div className="rounded-md bg-muted p-3">
              <p className="text-xs text-muted-foreground">
                You were referred with code: <span className="font-mono font-semibold">{referralCode}</span>
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
            disabled={submitting}
            className="bg-stellar-teal hover:bg-stellar-teal/90"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Complete Setup"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
