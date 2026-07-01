"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@/lib/wallet-context";
import {
  upsertUserProfile,
  fetchUserProfile,
  createReferral,
  logUserActivity,
  type UserProfileRow,
} from "@/lib/supabase";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, UserPlus, Sparkles, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface OnboardingModalProps {
  open: boolean;
  onClose: () => void;
}

function generateReferralCode(address: string): string {
  const prefix = address.slice(0, 4).toUpperCase();
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `DIVIFY-${prefix}${suffix}`;
}

export function OnboardingModal({ open, onClose }: OnboardingModalProps) {
  const { publicKey } = useWallet();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [existingProfile, setExistingProfile] = useState<UserProfileRow | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!open || !publicKey) return;
    let cancelled = false;
    setChecking(true);
    fetchUserProfile(publicKey).then(({ data, error }) => {
      if (cancelled) return;
      setChecking(false);
      if (error) {
        return;
      }
      if (data) {
        setExistingProfile(data);
        setName(data.name);
        setEmail(data.email);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [open, publicKey]);

  const handleSubmit = async () => {
    if (!publicKey) return;
    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (!email.trim() || !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setSubmitting(true);
    const newReferralCode = existingProfile?.referral_code ?? generateReferralCode(publicKey);
    let referredBy: string | null = null;

    if (referralCode.trim() && !existingProfile) {
      const { data: referrer } = await fetchUserProfile("");
      void referrer;
      referredBy = referralCode.trim();
    }

    const { data, error } = await upsertUserProfile(
      publicKey,
      name.trim(),
      email.trim(),
      newReferralCode,
      referredBy
    );

    if (error) {
      toast.error("Failed to save profile: " + error);
      setSubmitting(false);
      return;
    }

    await logUserActivity(publicKey, "onboarding_completed", name.trim());

    if (referralCode.trim() && !existingProfile && data) {
      const { data: referrerProfile } = await fetchUserProfile("");
      void referrerProfile;
    }

    toast.success("Welcome to Divify! Your profile is set up.");
    setSubmitting(false);
    onClose();
  };

  const isOnboarded = existingProfile?.onboarded;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            {isOnboarded ? (
              <>
                <CheckCircle2 className="h-5 w-5 text-stellar-green" />
                Profile
              </>
            ) : (
              <>
                <UserPlus className="h-5 w-5 text-stellar-teal" />
                Welcome to Divify
              </>
            )}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {isOnboarded
              ? "Update your profile information below."
              : "Complete your profile to join the Divify community and start splitting expenses."}
          </DialogDescription>
        </DialogHeader>

        {checking ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-stellar-teal" />
          </div>
        ) : (
          <div className="flex flex-col gap-4 py-2">
            {isOnboarded && (
              <div className="flex items-center gap-2 rounded-lg border border-stellar-green/30 bg-stellar-green/5 px-3 py-2">
                <Badge
                  variant="outline"
                  className="border-stellar-green/40 text-stellar-green text-xs"
                >
                  Onboarded
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Referral code: {existingProfile?.referral_code ?? "N/A"}
                </span>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="onb-name" className="text-foreground text-sm">
                Name
              </Label>
              <Input
                id="onb-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="bg-background border-border"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="onb-email" className="text-foreground text-sm">
                Email
              </Label>
              <Input
                id="onb-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="bg-background border-border"
              />
            </div>

            {!isOnboarded && (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="onb-referral" className="text-foreground text-sm">
                  Referral Code <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Input
                  id="onb-referral"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                  placeholder="DIVIFY-XXXX"
                  className="bg-background border-border"
                />
                <p className="text-xs text-muted-foreground">
                  Got a referral code from a friend? Enter it here.
                </p>
              </div>
            )}

            <div className="flex items-center gap-2 rounded-lg border border-stellar-teal/20 bg-stellar-teal/5 px-3 py-2.5">
              <Sparkles className="h-4 w-4 text-stellar-teal shrink-0" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                Your referral code will be generated automatically. Share it to
                invite friends and grow the Divify community.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1 border-border"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 bg-stellar-teal text-primary-foreground hover:bg-stellar-teal/90 gap-2"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <UserPlus className="h-4 w-4" />
                )}
                {isOnboarded ? "Update" : "Complete Setup"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
