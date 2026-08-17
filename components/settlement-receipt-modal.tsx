"use client";

import { useState } from "react";
import {
  buildReceipt,
  downloadReceiptAsText,
  downloadReceiptAsJSON,
  type ExpenseParticipant,
} from "@/lib/receipt-generator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, FileJson, CheckCircle2, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SettlementReceiptModalProps {
  open: boolean;
  onClose: () => void;
  expenseId: string | number;
  description: string;
  payer: string;
  totalAmountXLM: string;
  participants: ExpenseParticipant[];
  txHash?: string;
}

export function SettlementReceiptModal({
  open,
  onClose,
  expenseId,
  description,
  payer,
  totalAmountXLM,
  participants,
  txHash,
}: SettlementReceiptModalProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const receipt = buildReceipt({
    expenseId,
    description,
    payer,
    totalAmountXLM,
    participants,
    txHash,
  });

  const short = (addr: string) =>
    addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "—";

  const handleCopyId = () => {
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(receipt.receiptId).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  const handleDownloadTxt = () => {
    downloadReceiptAsText(receipt);
    toast({ title: "Receipt downloaded", description: `${receipt.receiptId}.txt saved.` });
  };

  const handleDownloadJson = () => {
    downloadReceiptAsJSON(receipt);
    toast({ title: "Receipt downloaded", description: `${receipt.receiptId}.json saved.` });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-stellar-teal" />
            Settlement Receipt
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Receipt ID */}
          <div className="rounded-lg bg-stellar-teal/5 border border-stellar-teal/15 p-4">
            <p className="text-xs text-muted-foreground mb-1">Receipt ID</p>
            <div className="flex items-center justify-between gap-2">
              <code className="text-sm font-mono font-semibold text-foreground">
                {receipt.receiptId}
              </code>
              <button
                onClick={handleCopyId}
                className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                id="receipt-copy-id-btn"
              >
                {copied ? (
                  <CheckCircle2 className="h-4 w-4 text-stellar-teal" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Expense details */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Description</span>
              <span className="font-medium text-right max-w-[60%] truncate">
                {description}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payer</span>
              <code className="text-xs font-mono">{short(payer)}</code>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total</span>
              <span className="font-semibold text-foreground">
                {totalAmountXLM} XLM
              </span>
            </div>
            {txHash && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">TX Hash</span>
                <a
                  href={`https://stellar.expert/explorer/testnet/tx/${txHash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-mono text-stellar-teal hover:underline"
                >
                  {short(txHash)}
                </a>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Network</span>
              <Badge variant="outline" className="text-[10px] border-stellar-teal/30 text-stellar-teal">
                Stellar Testnet
              </Badge>
            </div>
          </div>

          {/* Participants */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
              Participants
            </p>
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {participants.map((p, i) => (
                <div
                  key={p.address}
                  className="flex items-center justify-between text-xs"
                >
                  <code className="text-muted-foreground font-mono">
                    {i + 1}. {short(p.address)}
                  </code>
                  <div className="flex items-center gap-2">
                    <span>{p.amount} XLM</span>
                    <Badge
                      variant="outline"
                      className={`text-[10px] ${
                        p.paid
                          ? "border-stellar-teal/40 text-stellar-teal"
                          : "border-yellow-500/40 text-yellow-500"
                      }`}
                    >
                      {p.paid ? "Paid" : "Pending"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Download buttons */}
          <div className="flex gap-2 pt-2 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadTxt}
              className="flex-1 gap-1.5 text-xs"
              id="receipt-download-txt-btn"
            >
              <FileText className="h-3.5 w-3.5" />
              Download .txt
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadJson}
              className="flex-1 gap-1.5 text-xs"
              id="receipt-download-json-btn"
            >
              <FileJson className="h-3.5 w-3.5" />
              Download .json
            </Button>
          </div>

          <p className="text-[10px] text-center text-muted-foreground">
            Verified on Stellar Testnet · Powered by Divify
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
