"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@/lib/wallet-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, Gift, Users, Loader2 } from "lucide-react";
import { generateReferralCode, getReferralsByUser, type ReferralRow } from "@/lib/supabase";

export function ReferralCard() {
  const { address } = useWallet();
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referrals, setReferrals] = useState<ReferralRow[]>([]);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReferralData() {
      if (!address) return;

      const [codeResult, referralsResult] = await Promise.all([
        generateReferralCode(address),
        getReferralsByUser(address),
      ]);

      if (!codeResult.error) {
        setReferralCode(codeResult.code);
      }

      if (!referralsResult.error) {
        setReferrals(referralsResult.data);
      }

      setLoading(false);
    }

    fetchReferralData();
  }, [address]);

  const copyToClipboard = async () => {
    if (!referralCode) return;

    const shareLink = `${typeof window !== "undefined" ? window.location.origin : ""}/?ref=${referralCode}`;
    await navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-pink-500" />
            <CardTitle className="text-sm font-medium">Referrals</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const completedCount = referrals.filter((r) => r.status === "completed").length;
  const pendingCount = referrals.filter((r) => r.status === "pending").length;

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
              {referrals.length}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {referralCode && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Your referral code</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 rounded-md bg-muted px-3 py-2 font-mono text-sm">
                {referralCode}
              </code>
              <Button
                variant="outline"
                size="icon"
                onClick={copyToClipboard}
                className="shrink-0"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        )}

        {referrals.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-md bg-muted p-2 text-center">
              <p className="text-lg font-semibold text-green-500">{completedCount}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
            <div className="rounded-md bg-muted p-2 text-center">
              <p className="text-lg font-semibold text-yellow-500">{pendingCount}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
          </div>
        )}

        {referrals.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-2">
            Share your code with friends to grow the Divify community.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
