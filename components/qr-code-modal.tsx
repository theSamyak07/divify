"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { QrCode, Copy, Check, Share2 } from "lucide-react";

interface QrCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  publicKey: string;
}

export function QrCodeModal({ isOpen, onClose, publicKey }: QrCodeModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!publicKey) return;
    navigator.clipboard.writeText(publicKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Generate SVG QR code representation visually
  const qrSvgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
    publicKey
  )}`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md text-center">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-center gap-2 text-xl">
            <QrCode className="h-5 w-5 text-stellar-teal" />
            Wallet QR Code
          </DialogTitle>
          <DialogDescription>
            Scan this QR code to quickly send payments or add this wallet to an expense split.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center p-4">
          <div className="bg-white p-4 rounded-xl border shadow-sm mb-4">
            {publicKey ? (
              // eslint-disable-next-next/no-img-element
              <img
                src={qrSvgUrl}
                alt="Stellar Wallet QR Code"
                className="w-48 h-48 rounded-lg"
              />
            ) : (
              <div className="w-48 h-48 flex items-center justify-center text-xs text-muted-foreground">
                No Wallet Connected
              </div>
            )}
          </div>

          <div className="w-full bg-muted/40 p-3 rounded-lg border text-left mb-4">
            <p className="text-xs text-muted-foreground font-semibold mb-1">
              Stellar Public Key
            </p>
            <p className="text-xs font-mono break-all text-foreground select-all">
              {publicKey || "Not connected"}
            </p>
          </div>

          <div className="flex gap-2 w-full">
            <Button
              onClick={handleCopy}
              className="flex-1 gap-2 bg-stellar-teal hover:bg-stellar-teal/90 text-primary-foreground"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied!" : "Copy Address"}
            </Button>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
