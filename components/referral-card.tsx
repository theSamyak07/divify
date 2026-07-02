"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Share2, Check, Users } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useWallet } from "@/lib/wallet-context";

export function ReferralCard() {
  const { publicKey } = useWallet();
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referralCount, setReferralCount] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (publicKey) {
      fetchReferralData();
    }
  }, [publicKey]);

  async function fetchReferralData() {
    if (!publicKey) return;
    try {
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("referral_code")
        .eq("wallet_address", publicKey)
        .single();
      if (profile?.referral_code) {
        setReferralCode(profile.referral_code);
      }

      const { count } = await supabase
        .from("referrals")
        .select("*", { count: "exact", head: true })
        .eq("referrer_address", publicKey);
      setReferralCount(count ?? 0);
    } catch (err) {
      console.error("Failed to fetch referral data:", err);
    }
  }

  async function handleCopy() {
    if (!referralCode) return;
    await navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleShare() {
    if (!referralCode) return;
    const shareUrl = `${window.location.origin}?ref=${referralCode}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join Divify",
          text: `Use my referral code ${referralCode} to join Divify!`,
          url: shareUrl,
        });
      } catch {
        handleCopy();
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  if (!referralCode) return null;

  return (
    <Card>
      <CardHeader className="pb-2 pt-3 px-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Users className="h-4 w-4 text-stellar-teal" />
          Your Referral Code
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-3 px-3 space-y-3">
        <div className="flex items-center gap-2">
          <code className="flex-1 px-3 py-2 rounded-md bg-secondary font-mono text-sm">
            {referralCode}
          </code>
          <Button
            variant="outline"
            size="icon"
            onClick={handleCopy}
            className="shrink-0"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {referralCount} referral{referralCount !== 1 ? "s" : ""}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="gap-1 text-xs"
          >
            <Share2 className="h-3 w-3" />
            Share
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
