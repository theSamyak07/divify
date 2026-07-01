"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@/lib/wallet-context";
import {
  fetchUserProfile,
  fetchReferralsByReferrer,
  type UserProfileRow,
  type ReferralRow,
} from "@/lib/supabase";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gift, Copy, Check, Share2, Users, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function ReferralCard() {
  const { publicKey } = useWallet();
  const [profile, setProfile] = useState<UserProfileRow | null>(null);
  const [referrals, setReferrals] = useState<ReferralRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!publicKey) return;
    let cancelled = false;
    setLoading(true);
    Promise.all([
      fetchUserProfile(publicKey),
      fetchReferralsByReferrer(publicKey),
    ]).then(([profileRes, referralsRes]) => {
      if (cancelled) return;
      if (profileRes.data) setProfile(profileRes.data);
      if (referralsRes.data) setReferrals(referralsRes.data);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [publicKey]);

  const handleCopy = () => {
    if (!profile?.referral_code) return;
    navigator.clipboard.writeText(profile.referral_code);
    setCopied(true);
    toast.success("Referral code copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (!profile?.referral_code) return;
    const shareUrl = `${window.location.origin}?ref=${profile.referral_code}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join Divify",
          text: "Split expenses on Stellar with Divify!",
          url: shareUrl,
        });
      } catch {
        // user cancelled
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast.success("Share link copied!");
    }
  };

  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-stellar-teal" />
        </CardContent>
      </Card>
    );
  }

  if (!profile) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="py-6">
          <p className="text-sm text-muted-foreground text-center">
            Complete onboarding to get your referral code
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <Gift className="h-5 w-5 text-stellar-green" />
          Referral Program
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Invite friends to grow the Divify community
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {/* Referral code */}
        <div className="rounded-lg border border-stellar-green/20 bg-stellar-green/5 p-3">
          <p className="text-xs text-muted-foreground mb-1">Your Referral Code</p>
          <div className="flex items-center justify-between gap-2">
            <code className="text-sm font-mono text-foreground font-semibold break-all">
              {profile.referral_code ?? "N/A"}
            </code>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="border-border shrink-0 gap-1.5"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-stellar-green" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
        </div>

        {/* Share button */}
        <Button
          onClick={handleShare}
          variant="outline"
          className="w-full border-stellar-green/30 bg-stellar-green/5 hover:bg-stellar-green/10 text-foreground gap-2"
        >
          <Share2 className="h-4 w-4 text-stellar-green" />
          Share Invite Link
        </Button>

        {/* Referral stats */}
        <div className="flex items-center justify-between rounded-lg border border-border bg-background p-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-stellar-green/10">
              <Users className="h-4 w-4 text-stellar-green" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                {referrals.length} Referrals
              </p>
              <p className="text-xs text-muted-foreground">
                Friends joined via your code
              </p>
            </div>
          </div>
          <Badge
            variant="outline"
            className="border-stellar-green/40 text-stellar-green"
          >
            Active
          </Badge>
        </div>

        {/* Recent referrals */}
        {referrals.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <p className="text-xs text-muted-foreground">Recent referrals</p>
            <div className="flex flex-col gap-1.5 max-h-32 overflow-y-auto">
              {referrals.slice(0, 5).map((ref) => (
                <div
                  key={ref.id}
                  className="flex items-center justify-between text-xs"
                >
                  <code className="font-mono text-muted-foreground">
                    {ref.referred_address.slice(0, 8)}...{ref.referred_address.slice(-4)}
                  </code>
                  <Badge
                    variant="outline"
                    className="text-[10px] border-stellar-green/30 text-stellar-green"
                  >
                    {ref.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
