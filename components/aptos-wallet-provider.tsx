"use client";

import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";

type AptosWalletProviderProps = {
  children: React.ReactNode;
};

export function AptosWalletProvider({ children }: AptosWalletProviderProps) {
  return (
    <AptosWalletAdapterProvider autoConnect={true} disableTelemetry={true}>
      {children}
    </AptosWalletAdapterProvider>
  );
}
