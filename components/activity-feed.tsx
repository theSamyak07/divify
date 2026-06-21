"use client";

import { useWallet } from "@/lib/wallet-context";
import { useEffect, useState } from "react";
import { shortenAddress } from "@/lib/stellar";
import { fetchPaymentsAction } from "@/lib/stellar-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

import type { PaymentRecord } from "@/lib/stellar";

export function ActivityFeed() {
  const { isConnected, publicKey } = useWallet();
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPayments = async () => {
    if (!publicKey) return;
    setLoading(true);
    const records = await fetchPaymentsAction(publicKey);
    setPayments(records);
    setLoading(false);
  };

  useEffect(() => {
    if (isConnected && publicKey) {
      fetchPayments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, publicKey]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!isConnected) {
    return (
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-foreground text-base">
            <Clock className="h-4 w-4 text-stellar-teal" />
            Recent Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Connect your wallet to view transaction history.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-foreground text-base">
          <Clock className="h-4 w-4 text-stellar-teal" />
          Recent Transactions
        </CardTitle>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-foreground"
          onClick={fetchPayments}
          disabled={loading}
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full bg-muted" />
                <div className="flex-1">
                  <Skeleton className="h-3 w-32 mb-1.5 bg-muted" />
                  <Skeleton className="h-2.5 w-20 bg-muted" />
                </div>
                <Skeleton className="h-3 w-16 bg-muted" />
              </div>
            ))}
          </div>
        ) : payments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 gap-2">
            <Clock className="h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No transactions found.</p>
            <p className="text-xs text-muted-foreground">
              Your testnet transactions will appear here.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {payments.map((op) => {
              const isOutgoing = op.from === publicKey;
              const counterparty = isOutgoing ? op.to : op.from;
              const assetLabel =
                op.asset_type === "native" ? "XLM" : (op.asset_code ?? "?");
              const amount = op.amount ? parseFloat(op.amount).toFixed(4) : null;

              return (
                <div
                  key={op.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors group"
                >
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full shrink-0 ${
                      isOutgoing
                        ? "bg-destructive/10 text-destructive"
                        : "bg-stellar-green/10 text-stellar-green"
                    }`}
                  >
                    {isOutgoing ? (
                      <ArrowUpRight className="h-4 w-4" />
                    ) : (
                      <ArrowDownLeft className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-medium text-foreground">
                        {isOutgoing ? "Sent" : "Received"}
                      </p>
                      {amount && (
                        <span className={`text-xs font-semibold ${isOutgoing ? "text-destructive" : "text-stellar-green"}`}>
                          {isOutgoing ? "-" : "+"}{amount} {assetLabel}
                        </span>
                      )}
                      <Badge
                        variant="outline"
                        className={`text-[9px] px-1 py-0 h-3.5 ${
                          op.transaction_successful
                            ? "border-stellar-green/30 text-stellar-green"
                            : "border-destructive/30 text-destructive"
                        }`}
                      >
                        {op.transaction_successful ? "Success" : "Failed"}
                      </Badge>
                    </div>
                    {counterparty && (
                      <p className="text-[10px] text-muted-foreground truncate font-mono">
                        {isOutgoing ? "To: " : "From: "}
                        {shortenAddress(counterparty)}
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[10px] text-muted-foreground">
                      {formatDate(op.created_at)}
                    </p>
                    <a
                      href={`https://stellar.expert/explorer/testnet/tx/${op.transaction_hash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-0.5 text-[10px] text-stellar-teal opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      View <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
