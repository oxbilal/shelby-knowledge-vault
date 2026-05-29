import type { Metadata } from "next";
import { AptosWalletProvider } from "@/components/aptos-wallet-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Shelby Knowledge Vault",
  description:
    "Upload files, preview files, download files, and ask AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body>
        <AptosWalletProvider>{children}</AptosWalletProvider>
      </body>
    </html>
  );
}
