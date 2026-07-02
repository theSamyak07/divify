import { Horizon, Keypair, TransactionBuilder, Operation, Asset, Memo, BASE_FEE } from "@stellar/stellar-sdk";

const HORIZON_URL = "https://horizon-testnet.stellar.org";
const NETWORK_PASSPHRASE = "Test SDF Network ; September 2015";
const FRIENDBOT_URL = "https://friendbot.stellar.org";

const server = new Horizon.Server(HORIZON_URL);

export interface WalletInfo {
  publicKey: string;
  secret: string;
}

export function generateWallet(): WalletInfo {
  const kp = Keypair.random();
  return {
    publicKey: kp.publicKey(),
    secret: kp.secret(),
  };
}

export async function fundAccount(publicKey: string, retries = 3): Promise<boolean> {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(`${FRIENDBOT_URL}?addr=${encodeURIComponent(publicKey)}`);
      if (res.ok) return true;
      if (res.status === 400) {
        const body = await res.json().catch(() => ({}));
        if (body?.detail?.includes("createAccountAlreadyExist")) return true;
      }
      await sleep(2000 * (i + 1));
    } catch {
      await sleep(2000 * (i + 1));
    }
  }
  return false;
}

export async function getBalance(publicKey: string): Promise<number> {
  try {
    const account = await server.loadAccount(publicKey);
    const native = account.balances.find((b: { asset_type: string }) => b.asset_type === "native");
    return native ? parseFloat(native.balance) : 0;
  } catch {
    return 0;
  }
}

export async function sendPayment(
  sourceKeypair: Keypair,
  destination: string,
  amount: string,
  memo?: string
): Promise<{ success: boolean; hash?: string; error?: string }> {
  try {
    const sourceAccount = await server.loadAccount(sourceKeypair.publicKey());

    let txBuilder = new TransactionBuilder(sourceAccount, {
      fee: BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    }).addOperation(
      Operation.payment({
        destination,
        asset: Asset.native(),
        amount,
      })
    );

    if (memo) {
      txBuilder = txBuilder.addMemo(Memo.text(memo));
    }

    const tx = txBuilder.setTimeout(30).build();
    tx.sign(sourceKeypair);

    const result = await server.submitTransaction(tx);
    return { success: true, hash: result.hash };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Transaction failed";
    return { success: false, error: message };
  }
}

export async function waitForAccount(publicKey: string, maxWaitMs = 30000): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    try {
      await server.loadAccount(publicKey);
      return true;
    } catch {
      await sleep(2000);
    }
  }
  return false;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export { server, Keypair };
