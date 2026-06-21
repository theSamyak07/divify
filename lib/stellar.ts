import { Horizon } from "@stellar/stellar-sdk";

export const STELLAR_NETWORK = "TESTNET";
export const STELLAR_HORIZON_URL = "https://horizon-testnet.stellar.org";
export const STELLAR_NETWORK_PASSPHRASE = "Test SDF Network ; September 2015";

export const horizonServer = new Horizon.Server(STELLAR_HORIZON_URL);

export function shortenAddress(address: string, chars = 6): string {
  if (!address) return "";
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export function formatXLM(amount: string | number): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 7,
  });
}

export interface StellarBalance {
  asset_type: string;
  asset_code?: string;
  asset_issuer?: string;
  balance: string;
}

export async function fetchAccountBalances(
  publicKey: string
): Promise<StellarBalance[]> {
  try {
    const account = await horizonServer.loadAccount(publicKey);
    return account.balances as StellarBalance[];
  } catch {
    // Account may not yet exist on testnet — return empty silently
    return [];
  }
}

export function getXLMBalance(balances: StellarBalance[]): string {
  const xlm = balances.find((b) => b.asset_type === "native");
  return xlm ? xlm.balance : "0";
}

export interface TransactionResult {
  success: boolean;
  hash?: string;
  error?: string;
}

/** Fund a Testnet account using Stellar Friendbot */
export async function fundWithFriendbot(
  publicKey: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(
      `https://friendbot.stellar.org?addr=${encodeURIComponent(publicKey)}`
    );
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      // 400 with "createAccountAlreadyExist" means account exists — treat as success
      const detail = body?.detail ?? "";
      if (detail.includes("createAccountAlreadyExist")) {
        return { success: true };
      }
      return { success: false, error: `Friendbot returned ${res.status}` };
    }
    return { success: true };
  } catch {
    return { success: false, error: "Could not reach Friendbot. Try again." };
  }
}
