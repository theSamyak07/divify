"use client";

import { useState, useEffect } from "react";
import {
  fetchExchangeRates,
  xlmToFiat,
  formatFiat,
  getSupportedCurrencies,
  type FiatCurrency,
  type ExchangeRates,
} from "@/lib/currency-converter";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, TrendingUp } from "lucide-react";

interface CurrencyConverterWidgetProps {
  /** If provided, shows conversion for this fixed XLM amount */
  xlmAmount?: number;
  /** If true, shows a compact single-line conversion */
  compact?: boolean;
}

export function CurrencyConverterWidget({
  xlmAmount,
  compact = false,
}: CurrencyConverterWidgetProps) {
  const [rates, setRates] = useState<ExchangeRates | null>(null);
  const [currency, setCurrency] = useState<FiatCurrency>("USD");
  const [inputXLM, setInputXLM] = useState<string>(
    xlmAmount != null ? String(xlmAmount) : "100"
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadRates = async (forceRefresh = false) => {
    if (forceRefresh) setRefreshing(true);
    const freshRates = await fetchExchangeRates();
    setRates(freshRates);
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    loadRates();
  }, []);

  // Sync prop changes
  useEffect(() => {
    if (xlmAmount != null) setInputXLM(String(xlmAmount));
  }, [xlmAmount]);

  const xlmValue = parseFloat(inputXLM) || 0;
  const fiatValue = rates ? xlmToFiat(xlmValue, currency, rates) : null;

  if (compact) {
    if (loading || !rates || fiatValue === null) {
      return (
        <span className="text-xs text-muted-foreground">
          Loading rates…
        </span>
      );
    }
    return (
      <span className="text-xs text-muted-foreground">
        ≈ {formatFiat(fiatValue, currency)}{" "}
        <Select
          value={currency}
          onValueChange={(v) => setCurrency(v as FiatCurrency)}
        >
          <SelectTrigger className="h-5 w-16 text-xs border-none p-0 shadow-none">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {getSupportedCurrencies().map((c) => (
              <SelectItem key={c} value={c} className="text-xs">
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </span>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-stellar-teal" />
          XLM Converter
        </h3>
        <div className="flex items-center gap-2">
          {rates && (
            <Badge
              variant="outline"
              className={`text-[10px] px-2 py-0.5 ${
                rates.source === "live"
                  ? "border-stellar-teal/40 text-stellar-teal"
                  : "border-muted text-muted-foreground"
              }`}
            >
              {rates.source === "live" ? "Live Rates" : "Cached Rates"}
            </Badge>
          )}
          <button
            onClick={() => loadRates(true)}
            disabled={refreshing}
            className="text-muted-foreground hover:text-foreground transition-colors"
            title="Refresh rates"
            id="currency-refresh-btn"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`}
            />
          </button>
        </div>
      </div>

      <div className="flex gap-2 mb-3">
        <div className="flex-1">
          <label className="text-xs text-muted-foreground mb-1 block">
            XLM Amount
          </label>
          <Input
            id="currency-xlm-input"
            type="number"
            min="0"
            step="0.0001"
            value={inputXLM}
            onChange={(e) => setInputXLM(e.target.value)}
            placeholder="100"
            className="h-9 text-sm"
            disabled={xlmAmount != null}
          />
        </div>
        <div className="w-28">
          <label className="text-xs text-muted-foreground mb-1 block">
            Currency
          </label>
          <Select
            value={currency}
            onValueChange={(v) => setCurrency(v as FiatCurrency)}
          >
            <SelectTrigger className="h-9 text-sm" id="currency-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {getSupportedCurrencies().map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="h-10 rounded-lg bg-muted animate-pulse" />
      ) : fiatValue !== null ? (
        <div className="rounded-lg bg-stellar-teal/5 border border-stellar-teal/15 px-4 py-3 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-foreground">
            {formatFiat(fiatValue, currency)}
          </span>
          <span className="text-xs text-muted-foreground">
            @ 1 XLM = {formatFiat(rates!.XLM_USD, "USD")}
          </span>
        </div>
      ) : null}

      {rates && (
        <p className="text-[10px] text-muted-foreground mt-2">
          Updated {new Date(rates.fetchedAt).toLocaleTimeString()} · Source: CoinGecko
        </p>
      )}
    </div>
  );
}
