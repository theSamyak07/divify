"use client";

// StellarWalletsKit singleton — initialised once on the client.
// Level 2: Multi-wallet support — Freighter, xBull, Albedo.
// Subpath imports follow the package's published "exports" map.

import { StellarWalletsKit, Networks } from "@creit.tech/stellar-wallets-kit";
import type { ISupportedWallet } from "@creit.tech/stellar-wallets-kit";

export { Networks };
export type { ISupportedWallet };
export { StellarWalletsKit };

let kitReady = false;

/** Initialise the kit once per browser session. Safe to call multiple times. */
export async function initWalletKit(): Promise<void> {
  if (kitReady || typeof window === "undefined") return;
  try {
    const { FreighterModule } = await import(
      "@creit.tech/stellar-wallets-kit/modules/freighter"
    );
    const { xBullModule } = await import(
      "@creit.tech/stellar-wallets-kit/modules/xbull"
    );
    const { AlbedoModule } = await import(
      "@creit.tech/stellar-wallets-kit/modules/albedo"
    );

    StellarWalletsKit.init({
      network: Networks.TESTNET,
      selectedWalletId: undefined,
      modules: [
        new FreighterModule(),
        new xBullModule(),
        new AlbedoModule(),
      ],
    });

    kitReady = true;
  } catch {
    // init failure is non-fatal; wallet connection will fall back gracefully
  }
}

export function isKitReady(): boolean {
  return kitReady;
}
