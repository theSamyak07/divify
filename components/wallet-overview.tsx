"use client";

import { useWallet } from "@/lib/wallet-context";
import { shortenAddress, formatXLM, fundWithFriendbot } from "@/lib/stellar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Wallet,
  Copy,
  ExternalLink,
  ArrowUpRight,
  RefreshCw,
  Loader2,
  Droplets,
} from "lucide-react";
import { useState } from "react";

interface WalletOverviewProps {
  onSendClick: () => void;
}

export function WalletOverview({ onSendClick }: WalletOverviewProps) {
  const {
    isConnected,
    publicKey,
    xlmBalance,
    balances,
    isLoading,
    connectWallet,
    refreshBalance,
  } = useWallet();

  const [copied, setCopied] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [funding, setFunding] = useState(false);
  const [fundMsg, setFundMsg] = useState<string | null>(null);

  const handleCopy = () => {
    if (!publicKey) return;
    navigator.clipboard.writeText(publicKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshBalance();
    setRefreshing(false);
  };

  const handleFaucet = async () => {
    if (!publicKey) return;
    setFunding(true);
    setFundMsg(null);
    const result = await fundWithFriendbot(publicKey);
    if (result.success) {
      setFundMsg("10,000 XLM added! Refreshing balance...");
      await refreshBalance();
    } else {
      setFundMsg(result.error ?? "Faucet request failed.");
    }
    setFunding(false);
    setTimeout(() => setFundMsg(null), 5000);
  };

  if (!isConnected) {
    return (
      <Card className="border-border bg-card stellar-glow">
        <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <Wallet className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-foreground text-lg">
              No Wallet Connected
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Connect your Freighter wallet to get started
            </p>
          </div>
          <Button
            onClick={connectWallet}
            disabled={isLoading}
            className="bg-stellar-teal text-primary-foreground hover:bg-stellar-teal/90 gap-2"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Wallet className="h-4 w-4" />
            )}
            Connect Freighter
          </Button>
          <p className="text-xs text-muted-foreground">
            Don&apos;t have Freighter?{" "}
            <a
              href="https://www.freighter.app/"
              target="_blank"
              rel="noreferrer"
              className="text-stellar-teal underline underline-offset-2"
            >
              Install it here
            </a>
          </p>
        </CardContent>
      </Card>
    );
  }

  const otherAssets = balances.filter((b) => b.asset_type !== "native");

  return (
    <Card className="border-border bg-card stellar-glow overflow-hidden">
      {/* Top accent bar */}
      <div className="h-1 w-full bg-stellar-teal" />
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="h-2 w-2 rounded-full bg-stellar-green animate-pulse" />
              <span className="text-xs text-muted-foreground font-medium">
                Stellar Testnet
              </span>
              <Badge
                variant="outline"
                className="text-[10px] border-stellar-teal/30 text-stellar-teal px-1.5 py-0 h-4"
              >
                Live
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground font-mono">
              {publicKey ? shortenAddress(publicKey, 8) : ""}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              onClick={handleCopy}
              title="Copy address"
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              onClick={handleRefresh}
              disabled={refreshing}
              title="Refresh balance"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`}
              />
            </Button>
            <a
              href={`https://stellar.expert/explorer/testnet/account/${publicKey}`}
              target="_blank"
              rel="noreferrer"
            >
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                title="View on explorer"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </Button>
            </a>
          </div>
        </div>

        {copied && (
          <div className="mb-3 text-xs text-stellar-teal">
            Address copied to clipboard!
          </div>
        )}

        {/* Balance */}
        <div className="mb-6">
          <p className="text-xs text-muted-foreground mb-1">XLM Balance</p>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-bold text-foreground tracking-tight">
              {formatXLM(xlmBalance)}
            </span>
            <span className="text-lg text-muted-foreground mb-0.5 font-medium">
              XLM
            </span>
          </div>
        </div>

        {/* Other assets */}
        {otherAssets.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            {otherAssets.map((asset, i) => (
              <div
                key={i}
                className="flex items-center gap-1.5 rounded-lg bg-muted px-3 py-1.5"
              >
                <span className="text-xs font-semibold text-foreground">
                  {asset.asset_code}
                </span>
                <span className="text-xs text-muted-foreground">
                  {parseFloat(asset.balance).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Faucet */}
        {parseFloat(xlmBalance) < 10 && (
          <div className="mb-4 rounded-lg border border-stellar-amber/30 bg-stellar-amber/5 px-3 py-2.5 flex items-start gap-2">
            <Droplets className="h-4 w-4 text-stellar-amber shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground">Low balance</p>
              <p className="text-[11px] text-muted-foreground">
                Fund your testnet wallet for free with Friendbot.
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleFaucet}
              disabled={funding}
              className="shrink-0 h-7 text-xs border-stellar-amber/40 text-stellar-amber hover:bg-stellar-amber/10 gap-1.5"
            >
              {funding ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Droplets className="h-3 w-3" />
              )}
              {funding ? "Funding..." : "Fund"}
            </Button>
          </div>
        )}

        {fundMsg && (
          <p className={`text-xs mb-3 ${fundMsg.includes("XLM added") ? "text-stellar-green" : "text-destructive"}`}>
            {fundMsg}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            onClick={onSendClick}
            className="flex-1 bg-stellar-teal text-primary-foreground hover:bg-stellar-teal/90 gap-2"
          >
            <ArrowUpRight className="h-4 w-4" />
            Send XLM
          </Button>
          <a
            href={`https://stellar.expert/explorer/testnet/account/${publicKey}`}
            target="_blank"
            rel="noreferrer"
            className="flex-1"
          >
            <Button
              variant="outline"
              className="w-full border-border gap-2 text-foreground"
            >
              <ExternalLink className="h-4 w-4" />
              View on Explorer
            </Button>
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
