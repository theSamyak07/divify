"use client";

import { useState, useEffect } from "react";
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
import { supabase } from "@/lib/supabase";
import { useWallet } from "@/lib/wallet-context";

interface OnboardingModalProps {
  open: boolean;
  onClose: () => void;
  initialReferralCode?: string | null;
}

export function OnboardingModal({ open, onClose, initialReferralCode }: OnboardingModalProps) {
  const { publicKey } = useWallet();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [existingProfile, setExistingProfile] = useState<{
    name: string;
    email: string;
    referral_code: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (publicKey && open) {
      checkProfile();
      if (initialReferralCode) {
        setReferralCode(initialReferralCode);
      }
    }
  }, [publicKey, open, initialReferralCode]);

  async function checkProfile() {
    if (!publicKey) return;
    setChecking(true);
    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("name, email, referral_code")
        .eq("wallet_address", publicKey)
        .single();
      if (data && !error) {
        setExistingProfile(data);
        setName(data.name || "");
        setEmail(data.email || "");
        setReferralCode("");
      }
    } catch {
      setExistingProfile(null);
    } finally {
      setChecking(false);
    }
  }

  async function handleSubmit() {
    if (!publicKey || !name || !email) return;

    setLoading(true);
    try {
      const generatedReferralCode = `DIVIFY-${publicKey.slice(2, 6)}${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

      const { error } = await supabase.from("user_profiles").upsert(
        {
          wallet_address: publicKey,
          name,
          email,
          onboarded: true,
          referral_code: generatedReferralCode,
          referred_by: referralCode || null,
          last_active: new Date().toISOString(),
        },
        { onConflict: "wallet_address" }
      );

      if (error) throw error;

      await supabase.from("user_activity").insert({
        wallet_address: publicKey,
        action_type: existingProfile ? "profile_updated" : "onboarding_completed",
        action_detail: name,
        tx_hash: null,
        amount_xlm: null,
      });

      onClose();
    } catch (err) {
      console.error("Failed to save profile:", err);
    } finally {
      setLoading(false);
    }
  }

  const isUpdate = existingProfile !== null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isUpdate ? "Update Your Profile" : "Complete Your Setup"}</DialogTitle>
          <DialogDescription>
            {isUpdate
              ? "Keep your profile information up to date."
              : "Tell us a bit about yourself to get started."}
          </DialogDescription>
        </DialogHeader>

        {checking ? (
          <div className="py-8 text-center text-sm text-muted-foreground">Loading...</div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>

            {!isUpdate && (
              <div className="space-y-2">
                <Label htmlFor="referral">Referral Code (Optional)</Label>
                <Input
                  id="referral"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                  placeholder="DIVIFY-XXXX"
                />
                {initialReferralCode && (
                  <p className="text-xs text-muted-foreground">
                    Referral code applied from invite link.
                  </p>
                )}
              </div>
            )}

            {isUpdate && existingProfile && (
              <div className="rounded-md bg-muted/50 p-3 text-xs space-y-1">
                <p>
                  <span className="font-medium">Your referral code:</span>{" "}
                  <code className="bg-background px-1.5 py-0.5 rounded">
                    {existingProfile.referral_code}
                  </code>
                </p>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !name || !email}
            className="flex-1 bg-stellar-teal text-primary-foreground hover:bg-stellar-teal/90"
          >
            {loading ? "Saving..." : isUpdate ? "Update Profile" : "Complete Setup"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
