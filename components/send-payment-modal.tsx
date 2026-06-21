"use client";

import { useState } from "react";
import { useWallet } from "@/lib/wallet-context";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowUpRight,
  ExternalLink,
  Copy,
} from "lucide-react";

interface SendPaymentModalProps {
  open: boolean;
  onClose: () => void;
  prefillDestination?: string;
  prefillAmount?: string;
  prefillMemo?: string;
}

type Status = "idle" | "sending" | "success" | "error";

export function SendPaymentModal({
  open,
  onClose,
  prefillDestination = "",
  prefillAmount = "",
  prefillMemo = "",
}: SendPaymentModalProps) {
  const { sendXLM, xlmBalance } = useWallet();

  const [destination, setDestination] = useState(prefillDestination);
  const [amount, setAmount] = useState(prefillAmount);
  const [memo, setMemo] = useState(prefillMemo);
  const [status, setStatus] = useState<Status>("idle");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [hashCopied, setHashCopied] = useState(false);

  const resetForm = () => {
    setDestination(prefillDestination);
    setAmount(prefillAmount);
    setMemo(prefillMemo);
    setStatus("idle");
    setTxHash(null);
    setErrorMsg(null);
    setHashCopied(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSend = async () => {
    if (!destination || !amount) return;
    setStatus("sending");
    setErrorMsg(null);
    const result = await sendXLM(destination, amount, memo || undefined);
    if (result.success && result.hash) {
      setTxHash(result.hash);
      setStatus("success");
    } else {
      setErrorMsg(result.error ?? "Transaction failed.");
      setStatus("error");
    }
  };

  const handleCopyHash = () => {
    if (!txHash) return;
    navigator.clipboard.writeText(txHash);
    setHashCopied(true);
    setTimeout(() => setHashCopied(false), 2000);
  };

  const isValid =
    destination.length > 0 &&
    amount.length > 0 &&
    parseFloat(amount) > 0 &&
    parseFloat(amount) <= parseFloat(xlmBalance);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <ArrowUpRight className="h-5 w-5 text-stellar-teal" />
            Send XLM
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Send XLM on the Stellar Testnet. Make sure the recipient address is
            correct.
          </DialogDescription>
        </DialogHeader>

        {status === "success" && txHash ? (
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-stellar-green/10">
              <CheckCircle2 className="h-8 w-8 text-stellar-green" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-foreground text-lg">
                Transaction Sent!
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Your XLM has been successfully sent on Testnet.
              </p>
            </div>
            <div className="w-full rounded-lg bg-muted p-3">
              <p className="text-xs text-muted-foreground mb-1">
                Transaction Hash
              </p>
              <div className="flex items-center gap-2">
                <p className="font-mono text-xs text-foreground truncate flex-1">
                  {txHash}
                </p>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0 text-muted-foreground hover:text-foreground"
                  onClick={handleCopyHash}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
              {hashCopied && (
                <p className="text-xs text-stellar-teal mt-1">Copied!</p>
              )}
            </div>
            <div className="flex w-full gap-2">
              <a
                href={`https://stellar.expert/explorer/testnet/tx/${txHash}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1"
              >
                <Button
                  variant="outline"
                  className="w-full gap-2 border-border text-foreground"
                >
                  <ExternalLink className="h-4 w-4" />
                  View on Explorer
                </Button>
              </a>
              <Button
                onClick={handleClose}
                className="flex-1 bg-stellar-teal text-primary-foreground hover:bg-stellar-teal/90"
              >
                Done
              </Button>
            </div>
          </div>
        ) : status === "error" ? (
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <XCircle className="h-8 w-8 text-destructive" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-foreground text-lg">
                Transaction Failed
              </p>
              <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                {errorMsg}
              </p>
            </div>
            <div className="flex w-full gap-2">
              <Button
                variant="outline"
                className="flex-1 border-border text-foreground"
                onClick={() => setStatus("idle")}
              >
                Try Again
              </Button>
              <Button
                onClick={handleClose}
                variant="outline"
                className="flex-1 border-destructive/30 text-destructive hover:bg-destructive/10"
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-1.5">
              <Label className="text-foreground text-sm">
                Recipient Address
              </Label>
              <Input
                placeholder="G... Stellar address"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="bg-input border-border text-foreground font-mono text-xs placeholder:font-sans"
                disabled={status === "sending"}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-foreground text-sm">Amount (XLM)</Label>
                <span className="text-xs text-muted-foreground">
                  Balance:{" "}
                  <span className="text-stellar-teal">
                    {parseFloat(xlmBalance).toFixed(2)} XLM
                  </span>
                </span>
              </div>
              <Input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0.0000001"
                step="0.0000001"
                className="bg-input border-border text-foreground"
                disabled={status === "sending"}
              />
              {amount && parseFloat(amount) > parseFloat(xlmBalance) && (
                <p className="text-xs text-destructive">
                  Amount exceeds your balance.
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-foreground text-sm">
                Memo{" "}
                <span className="text-muted-foreground font-normal">
                  (optional)
                </span>
              </Label>
              <Input
                placeholder="e.g. Dinner split - Pizza night"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                maxLength={28}
                className="bg-input border-border text-foreground"
                disabled={status === "sending"}
              />
              <p className="text-xs text-muted-foreground">
                {memo.length}/28 characters
              </p>
            </div>

            <div className="flex gap-2 pt-1">
              <Button
                variant="outline"
                className="flex-1 border-border text-foreground"
                onClick={handleClose}
                disabled={status === "sending"}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSend}
                disabled={!isValid || status === "sending"}
                className="flex-1 bg-stellar-teal text-primary-foreground hover:bg-stellar-teal/90 gap-2"
              >
                {status === "sending" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <ArrowUpRight className="h-4 w-4" />
                    Send XLM
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
