"use client";

import { useMemo } from "react";
import {
  useWallet,
  WalletReadyState,
} from "@aptos-labs/wallet-adapter-react";
import { Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";

function shortenAddress(address?: string) {
  if (!address) {
    return "";
  }

  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function HeaderWalletConnect() {
  const { account, connect, connected, disconnect, isLoading, wallets } = useWallet();

  const installedWallet = useMemo(
    () => wallets.find((item) => item.readyState === WalletReadyState.Installed),
    [wallets],
  );

  const address = account?.address.toString();

  if (connected && address) {
    return (
      <div className="flex items-center justify-end gap-2">
        <div className="hidden items-center gap-2 rounded-md border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-slate-300 sm:flex">
          <Wallet className="size-3.5 text-primary" />
          {shortenAddress(address)}
        </div>
        <Button variant="outline" size="sm" onClick={disconnect} disabled={isLoading}>
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <div className="flex justify-end">
      <Button
        variant="secondary"
        size="sm"
        onClick={() => installedWallet && connect(installedWallet.name)}
        disabled={isLoading || !installedWallet}
        title={installedWallet ? "Connect wallet" : "No Aptos wallet detected"}
      >
        <Wallet />
        Connect wallet
      </Button>
    </div>
  );
}
