"use client";

// Level 2/3: Displays the deployed contract address + live expense event stream.
// Polls fetchContractExpenseEventsAction every 15s for real-time updates.

import { useEffect, useState, useCallback, useRef } from "react";
import { useWallet } from "@/lib/wallet-context";
import {
  fetchContractExpenseEventsAction,
  getContractAddressAction,
  type ContractExpenseEvent,
} from "@/lib/stellar-actions";
import { shortenAddress } from "@/lib/stellar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FileCode2,
  ExternalLink,
  RefreshCw,
  Zap,
  Copy,
  CheckCheck,
} from "lucide-react";

const POLL_INTERVAL_MS = 15_000;

interface ContractMeta {
  address: string;
  network: string;
  rpc_url: string;
}

export function ContractInfo() {
  const { isConnected, publicKey } = useWallet();
  const [meta, setMeta] = useState<ContractMeta | null>(null);
  const [events, setEvents] = useState<ContractExpenseEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch contract meta once on mount
  useEffect(() => {
    getContractAddressAction().then(setMeta);
  }, []);

  const fetchEvents = useCallback(async () => {
    if (!publicKey) return;
    setLoading(true);
    const data = await fetchContractExpenseEventsAction(publicKey);
    setEvents(data);
    setLastUpdated(new Date());
    setLoading(false);
  }, [publicKey]);

  // Start/stop polling when wallet connects
  useEffect(() => {
    if (isConnected && publicKey) {
      fetchEvents();
      pollingRef.current = setInterval(fetchEvents, POLL_INTERVAL_MS);
    }
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [isConnected, publicKey, fetchEvents]);

  const handleCopyAddress = () => {
    if (!meta) return;
    navigator.clipboard.writeText(meta.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-foreground text-base">
            <FileCode2 className="h-4 w-4 text-stellar-teal" />
            Deployed Contract
          </CardTitle>
          <div className="flex items-center gap-2">
            {lastUpdated && (
              <span className="text-[10px] text-muted-foreground">
                Updated {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            <div className="flex h-2 w-2 rounded-full bg-stellar-green animate-pulse" />
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              onClick={fetchEvents}
              disabled={loading || !isConnected}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {/* Contract address */}
        {meta ? (
          <div className="rounded-lg bg-muted/60 border border-border p-3 flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="text-[10px] border-stellar-green/30 text-stellar-green px-1.5 gap-1"
                >
                  <Zap className="h-2.5 w-2.5" />
                  {meta.network}
                </Badge>
                <span className="text-[11px] text-muted-foreground">
                  Stellar Asset Contract (SAC)
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-[10px] px-2 text-muted-foreground hover:text-foreground gap-1"
                onClick={handleCopyAddress}
              >
                {copied ? (
                  <CheckCheck className="h-3 w-3 text-stellar-green" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
            <p className="font-mono text-[11px] text-foreground break-all">
              {meta.address}
            </p>
            <div className="flex items-center gap-3">
              <a
                href={`https://stellar.expert/explorer/testnet/contract/${meta.address}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-stellar-teal hover:underline"
              >
                View on Explorer <ExternalLink className="h-2.5 w-2.5" />
              </a>
              <a
                href={meta.rpc_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
              >
                RPC Endpoint <ExternalLink className="h-2.5 w-2.5" />
              </a>
            </div>
          </div>
        ) : (
          <Skeleton className="h-20 w-full bg-muted" />
        )}

        {/* Live event feed */}
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium text-foreground flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5 text-stellar-amber" />
            Live Payment Events
            <Badge
              variant="outline"
              className="text-[9px] h-4 px-1.5 border-stellar-amber/30 text-stellar-amber ml-1"
            >
              Polling 15s
            </Badge>
          </p>

          {!isConnected ? (
            <p className="text-xs text-muted-foreground py-2">
              Connect wallet to view your on-chain events.
            </p>
          ) : loading && events.length === 0 ? (
            <div className="flex flex-col gap-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-10 w-full bg-muted" />
              ))}
            </div>
          ) : events.length === 0 ? (
            <p className="text-xs text-muted-foreground py-2">
              No outbound payments found. Send XLM to generate events.
            </p>
          ) : (
            <div className="flex flex-col gap-1.5 max-h-52 overflow-y-auto scrollbar-thin">
              {events.map((ev) => (
                <div
                  key={ev.id}
                  className="flex items-center justify-between gap-2 rounded-lg border border-border bg-background/60 px-3 py-2 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">
                      {ev.description || "Payment"}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-mono">
                      To: {shortenAddress(ev.payer !== publicKey ? ev.payer : "...")}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-semibold text-destructive">
                      -{parseFloat(ev.amount_xlm).toFixed(4)} XLM
                    </p>
                    <a
                      href={`https://stellar.expert/explorer/testnet/tx/${ev.tx_hash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] text-stellar-teal hover:underline inline-flex items-center gap-0.5"
                    >
                      Tx <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
