"use client";

import { useState } from "react";
import { useWallet } from "@/lib/wallet-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { SendPaymentModal } from "@/components/send-payment-modal";
import {
  Users,
  Plus,
  Trash2,
  Receipt,
  ArrowUpRight,
  Calculator,
  Split,
} from "lucide-react";

interface Participant {
  id: string;
  name: string;
  address: string;
}

interface SplitResult {
  participant: Participant;
  amount: string;
  amountXLM: number;
}

const XLM_PRICE_USD = 0.11; // approximate testnet sim price

export function ExpenseSplitter() {
  const { isConnected } = useWallet();

  const [expenseName, setExpenseName] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [currency, setCurrency] = useState<"XLM" | "USD">("USD");
  const [participants, setParticipants] = useState<Participant[]>([
    { id: "1", name: "", address: "" },
    { id: "2", name: "", address: "" },
  ]);
  const [splitResults, setSplitResults] = useState<SplitResult[]>([]);
  const [sendModal, setSendModal] = useState<{
    open: boolean;
    destination: string;
    amount: string;
    memo: string;
  }>({ open: false, destination: "", amount: "", memo: "" });

  const addParticipant = () => {
    setParticipants((prev) => [
      ...prev,
      { id: Date.now().toString(), name: "", address: "" },
    ]);
  };

  const removeParticipant = (id: string) => {
    if (participants.length <= 2) return;
    setParticipants((prev) => prev.filter((p) => p.id !== id));
    setSplitResults([]);
  };

  const updateParticipant = (
    id: string,
    field: keyof Participant,
    value: string
  ) => {
    setParticipants((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
    setSplitResults([]);
  };

  const calculateSplit = () => {
    const total = parseFloat(totalAmount);
    if (!total || total <= 0 || participants.length === 0) return;

    const perPerson = total / participants.length;
    const perPersonXLM =
      currency === "USD" ? perPerson / XLM_PRICE_USD : perPerson;

    const results: SplitResult[] = participants.map((p) => ({
      participant: p,
      amount: perPerson.toFixed(currency === "USD" ? 2 : 7),
      amountXLM: parseFloat(perPersonXLM.toFixed(7)),
    }));

    setSplitResults(results);
    pendo.track("expense_split_calculated", {
      expenseName: expenseName,
      totalAmount: total,
      currency: currency,
      participantCount: participants.length,
      perPersonAmountXLM: parseFloat(perPersonXLM.toFixed(7)),
    });
  };

  const handleSendPayment = (result: SplitResult) => {
    setSendModal({
      open: true,
      destination: result.participant.address,
      amount: result.amountXLM.toFixed(7),
      memo: expenseName ? `Divify: ${expenseName}` : "Divify split",
    });
  };

  const validParticipants = participants.filter((p) => p.address.trim());
  const canCalculate =
    totalAmount &&
    parseFloat(totalAmount) > 0 &&
    participants.length >= 2;

  return (
    <>
      <Card className="border-border bg-card">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-foreground text-base">
            <Split className="h-4 w-4 text-stellar-teal" />
            Expense Splitter
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          {/* Expense details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label className="text-foreground text-sm">
                Expense Name
              </Label>
              <Input
                placeholder="e.g. Tokyo dinner, AirBnB split"
                value={expenseName}
                onChange={(e) => setExpenseName(e.target.value)}
                className="bg-input border-border text-foreground"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-foreground text-sm">Total Amount</Label>
              <div className="flex gap-1.5">
                <div className="flex rounded-lg overflow-hidden border border-border">
                  {(["USD", "XLM"] as const).map((c) => (
                    <button
                      key={c}
                      onClick={() => {
                        setCurrency(c);
                        setSplitResults([]);
                      }}
                      className={`px-3 py-2 text-xs font-semibold transition-colors ${
                        currency === c
                          ? "bg-stellar-teal text-primary-foreground"
                          : "bg-input text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
                <Input
                  type="number"
                  placeholder={currency === "USD" ? "0.00" : "0.0000000"}
                  value={totalAmount}
                  onChange={(e) => {
                    setTotalAmount(e.target.value);
                    setSplitResults([]);
                  }}
                  className="bg-input border-border text-foreground flex-1"
                  min="0"
                  step={currency === "USD" ? "0.01" : "0.0000001"}
                />
              </div>
              {currency === "USD" && totalAmount && (
                <p className="text-xs text-muted-foreground">
                  ≈{" "}
                  {(parseFloat(totalAmount) / XLM_PRICE_USD).toFixed(2)} XLM
                  total
                </p>
              )}
            </div>
          </div>

          {/* Participants */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-stellar-teal" />
                <Label className="text-foreground text-sm font-medium">
                  Participants
                </Label>
                <Badge
                  variant="outline"
                  className="text-[10px] border-border text-muted-foreground h-4 px-1.5"
                >
                  {participants.length}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={addParticipant}
                className="h-7 text-xs gap-1.5 text-stellar-teal hover:text-stellar-teal hover:bg-stellar-teal/10"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Person
              </Button>
            </div>

            <div className="flex flex-col gap-2">
              {participants.map((p, idx) => (
                <div key={p.id} className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground shrink-0">
                    {idx + 1}
                  </div>
                  <Input
                    placeholder="Name"
                    value={p.name}
                    onChange={(e) =>
                      updateParticipant(p.id, "name", e.target.value)
                    }
                    className="bg-input border-border text-foreground w-28 sm:w-36 shrink-0"
                  />
                  <Input
                    placeholder="G... Stellar address"
                    value={p.address}
                    onChange={(e) =>
                      updateParticipant(p.id, "address", e.target.value)
                    }
                    className="bg-input border-border text-foreground font-mono text-xs flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() => removeParticipant(p.id)}
                    disabled={participants.length <= 2}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Calculate button */}
          <Button
            onClick={calculateSplit}
            disabled={!canCalculate}
            className="w-full bg-stellar-teal text-primary-foreground hover:bg-stellar-teal/90 gap-2"
          >
            <Calculator className="h-4 w-4" />
            Calculate Split
          </Button>

          {/* Results */}
          {splitResults.length > 0 && (
            <div className="flex flex-col gap-3 border-t border-border pt-4">
              <div className="flex items-center gap-2">
                <Receipt className="h-4 w-4 text-stellar-teal" />
                <span className="text-sm font-semibold text-foreground">
                  Split Results
                </span>
                {expenseName && (
                  <Badge
                    variant="outline"
                    className="text-[10px] border-stellar-teal/30 text-stellar-teal px-1.5"
                  >
                    {expenseName}
                  </Badge>
                )}
              </div>

              <div className="rounded-lg border border-border overflow-hidden">
                <div className="grid grid-cols-3 gap-2 px-3 py-2 bg-muted text-xs text-muted-foreground font-medium">
                  <span>Participant</span>
                  <span className="text-right">
                    {currency === "USD" ? "USD" : "XLM"}
                  </span>
                  <span className="text-right">XLM</span>
                </div>
                {splitResults.map((r) => (
                  <div
                    key={r.participant.id}
                    className="grid grid-cols-3 gap-2 items-center px-3 py-3 border-t border-border hover:bg-accent/50 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {r.participant.name || `Person ${splitResults.indexOf(r) + 1}`}
                      </p>
                      {r.participant.address && (
                        <p className="text-[10px] text-muted-foreground font-mono truncate max-w-[100px]">
                          {r.participant.address.slice(0, 6)}...
                          {r.participant.address.slice(-4)}
                        </p>
                      )}
                    </div>
                    <p className="text-right text-sm font-semibold text-foreground">
                      {currency === "USD" ? `$${r.amount}` : `${r.amount} XLM`}
                    </p>
                    <div className="flex flex-col items-end gap-1">
                      <p className="text-sm font-semibold text-stellar-teal">
                        {r.amountXLM.toFixed(4)} XLM
                      </p>
                      {isConnected && r.participant.address && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 text-[10px] px-2 text-stellar-teal hover:bg-stellar-teal/10 gap-1"
                          onClick={() => handleSendPayment(r)}
                        >
                          <ArrowUpRight className="h-3 w-3" />
                          Send
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="flex items-center justify-between rounded-lg bg-stellar-teal/5 border border-stellar-teal/20 px-4 py-3">
                <div>
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="text-sm font-bold text-foreground">
                    {currency === "USD"
                      ? `$${parseFloat(totalAmount).toFixed(2)} USD`
                      : `${parseFloat(totalAmount).toFixed(7)} XLM`}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">
                    Per Person ({splitResults.length})
                  </p>
                  <p className="text-sm font-bold text-stellar-teal">
                    {splitResults[0]?.amountXLM.toFixed(4)} XLM
                  </p>
                </div>
              </div>

              {validParticipants.length < participants.length && (
                <p className="text-xs text-muted-foreground">
                  {participants.length - validParticipants.length} participant(s)
                  without addresses — add Stellar addresses to enable sending.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <SendPaymentModal
        open={sendModal.open}
        onClose={() =>
          setSendModal({ open: false, destination: "", amount: "", memo: "" })
        }
        prefillDestination={sendModal.destination}
        prefillAmount={sendModal.amount}
        prefillMemo={sendModal.memo}
      />
    </>
  );
}
