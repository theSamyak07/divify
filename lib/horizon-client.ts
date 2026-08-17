/**
 * horizon-client.ts — Resilient Stellar Horizon API client
 *
 * Wraps all Horizon requests with exponential backoff retry logic,
 * request deduplication (in-flight map), and configurable timeouts.
 * Addresses user feedback: "Horizon retry backoff for unstable testnet connections."
 */

import { STELLAR_HORIZON_URL } from "./stellar";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface HorizonRequestOptions {
  /** Maximum number of retry attempts (default: 3) */
  maxRetries?: number;
  /** Initial delay in ms before first retry (default: 500) */
  initialDelayMs?: number;
  /** Request timeout in ms (default: 8000) */
  timeoutMs?: number;
}

// In-flight request deduplication map
const inFlightRequests = new Map<string, Promise<Response>>();

// ---------------------------------------------------------------------------
// Core fetch with retry
// ---------------------------------------------------------------------------

/**
 * Fetch a Horizon endpoint with exponential backoff retry.
 * Automatically deduplicates simultaneous identical requests.
 */
export async function horizonFetch(
  path: string,
  options: HorizonRequestOptions = {}
): Promise<Response> {
  const {
    maxRetries = 3,
    initialDelayMs = 500,
    timeoutMs = 8000,
  } = options;

  const url = `${STELLAR_HORIZON_URL}${path}`;
  const cacheKey = url;

  // Return in-flight request if one is already pending for this URL
  if (inFlightRequests.has(cacheKey)) {
    return inFlightRequests.get(cacheKey)!;
  }

  const requestPromise = (async (): Promise<Response> => {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        const res = await fetch(url, {
          headers: { Accept: "application/json" },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // Retry on 429 (rate limit) and 5xx server errors
        if (res.status === 429 || res.status >= 500) {
          throw new Error(`Horizon HTTP ${res.status}`);
        }

        return res;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));

        if (attempt < maxRetries) {
          // Exponential backoff: 500ms, 1000ms, 2000ms, ...
          const delay = initialDelayMs * Math.pow(2, attempt);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError ?? new Error("Horizon request failed after retries");
  })();

  inFlightRequests.set(cacheKey, requestPromise);

  try {
    const result = await requestPromise;
    return result;
  } finally {
    inFlightRequests.delete(cacheKey);
  }
}

// ---------------------------------------------------------------------------
// Convenience methods
// ---------------------------------------------------------------------------

/**
 * Fetch and parse a Horizon endpoint as JSON.
 * Returns null on failure instead of throwing.
 */
export async function horizonGet<T>(
  path: string,
  options?: HorizonRequestOptions
): Promise<T | null> {
  try {
    const res = await horizonFetch(path, options);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

/**
 * Fetch account details from Horizon with retry.
 */
export async function getAccountDetails(address: string) {
  return horizonGet<{
    id: string;
    sequence: string;
    balances: Array<{ asset_type: string; balance: string }>;
    subentry_count: number;
  }>(`/accounts/${address}`);
}

/**
 * Fetch recent payments for an account with retry.
 */
export async function getAccountPayments(
  address: string,
  limit = 20,
  order: "asc" | "desc" = "desc"
) {
  return horizonGet<{
    _embedded: { records: unknown[] };
  }>(`/accounts/${address}/payments?order=${order}&limit=${limit}`);
}
