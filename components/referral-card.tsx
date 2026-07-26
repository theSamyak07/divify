"use client";

import { useState, useEffect, useCallback } from "react";
import { useWallet } from "@/lib/wallet-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, Gift, Users, Share2 } from "lucide-react";
import {
  getWalletReferralCode,
  getReferrals,
  type ReferralEntry,
} from "@/lib/local-storage";

export function ReferralCard() {
  const { publicKey } = useWallet();
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referrals, setReferrals] = useState<ReferralEntry[]>([]);
  const [copied, setCopied] = useState(false);

  const loadReferralData = useCallback(() => {
    if (!publicKey) return;
    const code = getWalletReferralCode(publicKey);
    setReferralCode(code);
    setReferrals(getReferrals(code));
  }, [publicKey]);

  useEffect(() => {
    loadReferralData();
  }, [loadReferralData]);

  const shareLink =
    typeof window !== "undefined" && referralCode
      ? `${window.location.origin}/?ref=${referralCode}`
      : "";

  const copyToClipboard = async () => {
    if (!shareLink) return;
    await navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareNatively = async () => {
    if (!shareLink) return;
    if (navigator.share) {
      await navigator.share({
        title: "Join Divify — Split expenses on Stellar",
        text: "I'm using Divify to split group expenses on Stellar Testnet. Join with my referral link:",
        url: shareLink,
      });
    } else {
      copyToClipboard();
    }
  };

  if (!publicKey) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-pink-500" />
            <CardTitle className="text-sm font-medium">Referrals</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground py-2">
            Connect your wallet to get a referral code.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-pink-500" />
            <CardTitle className="text-sm font-medium">Referrals</CardTitle>
          </div>
          {referrals.length > 0 && (
            <Badge variant="secondary" className="gap-1">
              <Users className="h-3 w-3" />
              {referrals.length} referred
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {referralCode && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Your referral code</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 rounded-md bg-muted px-3 py-2 font-mono text-sm font-bold tracking-wider">
                {referralCode}
              </code>
              <Button
                variant="outline"
                size="icon"
                onClick={copyToClipboard}
                className="shrink-0"
                title="Copy link"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={shareNatively}
                className="shrink-0"
                title="Share"
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground break-all">
              {shareLink}
            </p>
          </div>
        )}

        {referrals.length > 0 ? (
          <div className="space-y-2">
            <p className="text-xs font-medium">People you referred</p>
            <div className="flex flex-col gap-1.5 max-h-32 overflow-y-auto">
              {referrals.map((r, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-xs text-muted-foreground bg-muted/50 rounded-md px-2 py-1.5"
                >
                  <span className="font-mono">
                    {r.referred_address.slice(0, 6)}…
                    {r.referred_address.slice(-4)}
                  </span>
                  <span className="text-[10px]">
                    {new Date(r.joined_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground text-center py-2">
            Share your code with friends to grow the Divify community!
          </p>
        )}
      </CardContent>
    </Card>
  );
}
