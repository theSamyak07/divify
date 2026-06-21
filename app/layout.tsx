import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Toaster } from "sonner";
import { WalletProvider } from "@/lib/wallet-context";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Divify — Multi-Currency Expense Splitter on Stellar",
  description:
    "Split group expenses and send XLM payments instantly on the Stellar network. A non-custodial dApp built for Stellar Journey to Mastery.",
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-background">
      <body className={`${spaceGrotesk.className} antialiased`}>
        <WalletProvider>{children}</WalletProvider>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "var(--card)",
              border: "1px solid var(--border)",
              color: "var(--foreground)",
            },
          }}
        />
        <Analytics />
      </body>
    </html>
  );
}
