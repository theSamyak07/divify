/**
 * currency-converter.ts — Live FX rate converter for Divify
 *
 * Fetches live XLM/USD/EUR/INR exchange rates from a public open-access API.
 * Falls back to static rates if network is unavailable.
 */

export type FiatCurrency = "USD" | "EUR" | "INR" | "GBP" | "AUD";

export interface ExchangeRates {
  XLM_USD: number;
  XLM_EUR: number;
  XLM_INR: number;
  XLM_GBP: number;
  XLM_AUD: number;
  fetchedAt: string;
  source: "live" | "fallback";
}

// Static fallback rates (updated Aug 2026 baseline)
const FALLBACK_RATES: ExchangeRates = {
  XLM_USD: 0.11,
  XLM_EUR: 0.10,
  XLM_INR: 9.15,
  XLM_GBP: 0.086,
  XLM_AUD: 0.167,
  fetchedAt: new Date().toISOString(),
  source: "fallback",
};

let ratesCache: ExchangeRates | null = null;
let cacheExpiry: number = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Fetch live XLM exchange rates.
 * Uses CoinGecko's free public API — no API key required.
 */
export async function fetchExchangeRates(): Promise<ExchangeRates> {
  // Return cached rates if still fresh
  if (ratesCache && Date.now() < cacheExpiry) return ratesCache;

  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=stellar&vs_currencies=usd,eur,inr,gbp,aud",
      { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(5000) }
    );

    if (!res.ok) throw new Error(`CoinGecko returned ${res.status}`);

    const data = await res.json();
    const xlm = data?.stellar;

    if (!xlm) throw new Error("Missing stellar key in response");

    ratesCache = {
      XLM_USD: xlm.usd ?? FALLBACK_RATES.XLM_USD,
      XLM_EUR: xlm.eur ?? FALLBACK_RATES.XLM_EUR,
      XLM_INR: xlm.inr ?? FALLBACK_RATES.XLM_INR,
      XLM_GBP: xlm.gbp ?? FALLBACK_RATES.XLM_GBP,
      XLM_AUD: xlm.aud ?? FALLBACK_RATES.XLM_AUD,
      fetchedAt: new Date().toISOString(),
      source: "live",
    };
    cacheExpiry = Date.now() + CACHE_TTL_MS;
    return ratesCache;
  } catch {
    return { ...FALLBACK_RATES, fetchedAt: new Date().toISOString() };
  }
}

/**
 * Convert an XLM amount to a fiat currency amount.
 */
export function xlmToFiat(
  xlmAmount: number,
  currency: FiatCurrency,
  rates: ExchangeRates
): number {
  const rate = rates[`XLM_${currency}` as keyof ExchangeRates] as number;
  return xlmAmount * rate;
}

/**
 * Convert a fiat amount to XLM.
 */
export function fiatToXlm(
  fiatAmount: number,
  currency: FiatCurrency,
  rates: ExchangeRates
): number {
  const rate = rates[`XLM_${currency}` as keyof ExchangeRates] as number;
  if (!rate || rate === 0) return 0;
  return fiatAmount / rate;
}

/**
 * Format a fiat amount with the appropriate currency symbol.
 */
export function formatFiat(amount: number, currency: FiatCurrency): string {
  const symbols: Record<FiatCurrency, string> = {
    USD: "$",
    EUR: "€",
    INR: "₹",
    GBP: "£",
    AUD: "A$",
  };
  return `${symbols[currency]}${amount.toFixed(2)}`;
}

/**
 * Get the list of supported fiat currencies.
 */
export function getSupportedCurrencies(): FiatCurrency[] {
  return ["USD", "EUR", "INR", "GBP", "AUD"];
}
