"use client";

import { useWallet } from "@/lib/wallet-context";
import { shortenAddress } from "@/lib/stellar";
import { fundWithFriendbotAction } from "@/lib/stellar-actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Wallet,
  ChevronDown,
  Copy,
  LogOut,
  RefreshCw,
  Loader2,
  AlertCircle,
  Droplets,
  ExternalLink,
} from "lucide-react";
import { useState } from "react";

export function DivifyHeader() {
  const {
    isConnected,
    publicKey,
    xlmBalance,
    isLoading,
    error,
    connectWallet,
    disconnectWallet,
    refreshBalance,
  } = useWallet();

  const [copied, setCopied] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [funding, setFunding] = useState(false);

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
    await fundWithFriendbotAction(publicKey);
    await refreshBalance();
    setFunding(false);
  };

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between border-b border-border bg-background/80 backdrop-blur-md px-6 py-4">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-stellar-teal text-primary-foreground font-bold text-base">
          D
        </div>
        <div>
          <span className="font-bold text-foreground text-lg tracking-tight">
            Divify
          </span>
          <Badge
            variant="outline"
            className="ml-2 text-[10px] border-stellar-teal/40 text-stellar-teal px-1.5 py-0"
          >
            Testnet
          </Badge>
        </div>
      </div>

      {/* Nav */}
      <nav className="hidden md:flex items-center gap-1">
        {["Dashboard", "Groups", "History"].map((item) => (
          <button
            key={item}
            className="px-4 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            {item}
          </button>
        ))}
      </nav>

      {/* Wallet */}
      <div className="flex items-center gap-3">
        {error && (
          <div className="flex items-center gap-1.5 text-destructive text-xs max-w-[200px]">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{error}</span>
          </div>
        )}

        {!isConnected ? (
          <Button
            onClick={connectWallet}
            disabled={isLoading}
            className="bg-stellar-teal text-primary-foreground hover:bg-stellar-teal/90 gap-2 font-medium"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Wallet className="h-4 w-4" />
            )}
            {isLoading ? "Connecting..." : "Connect Wallet"}
          </Button>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="border-stellar-teal/30 bg-stellar-teal/5 hover:bg-stellar-teal/10 gap-2 font-mono text-sm"
              >
                <div className="h-2 w-2 rounded-full bg-stellar-green animate-pulse" />
                <span className="hidden sm:inline text-foreground">
                  {shortenAddress(publicKey!)}
                </span>
                <span className="text-stellar-teal font-semibold font-sans">
                  {parseFloat(xlmBalance).toFixed(2)} XLM
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-64 bg-card border-border"
            >
              <div className="px-3 py-2.5">
                <p className="text-xs text-muted-foreground mb-0.5">
                  Connected Wallet
                </p>
                <p className="font-mono text-xs text-foreground break-all">
                  {publicKey}
                </p>
              </div>
              <DropdownMenuSeparator />
              <div className="px-3 py-2">
                <p className="text-xs text-muted-foreground">XLM Balance</p>
                <p className="text-xl font-bold text-stellar-teal">
                  {parseFloat(xlmBalance).toFixed(7)}{" "}
                  <span className="text-sm font-normal text-muted-foreground">
                    XLM
                  </span>
                </p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleCopy} className="gap-2 cursor-pointer">
                <Copy className="h-4 w-4" />
                {copied ? "Copied!" : "Copy Address"}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleRefresh}
                className="gap-2 cursor-pointer"
                disabled={refreshing}
              >
                <RefreshCw
                  className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
                />
                Refresh Balance
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleFaucet}
                className="gap-2 cursor-pointer text-stellar-amber focus:text-stellar-amber"
                disabled={funding}
              >
                {funding ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Droplets className="h-4 w-4" />
                )}
                {funding ? "Funding..." : "Fund with Testnet XLM"}
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="gap-2 cursor-pointer">
                <a
                  href={`https://stellar.expert/explorer/testnet/account/${publicKey}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <ExternalLink className="h-4 w-4" />
                  View on Explorer
                </a>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={disconnectWallet}
                className="gap-2 cursor-pointer text-destructive focus:text-destructive"
              >
                <LogOut className="h-4 w-4" />
                Disconnect
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
