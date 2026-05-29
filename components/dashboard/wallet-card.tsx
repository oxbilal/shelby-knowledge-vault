"use client";

import { useMemo, useState } from "react";
import {
  useWallet,
  WalletReadyState,
  type AdapterWallet,
} from "@aptos-labs/wallet-adapter-react";
import { Activity, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

function shortenAddress(address?: string) {
  if (!address) {
    return "";
  }

  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function getWalletLabel(wallet?: AdapterWallet) {
  return wallet?.name ?? "Wallet";
}

export function WalletCard() {
  const { account, connect, connected, disconnect, isLoading, wallet, wallets } = useWallet();
  const [walletError, setWalletError] = useState("");

  const installedWallet = useMemo(
    () => wallets.find((item) => item.readyState === WalletReadyState.Installed) ?? wallets[0],
    [wallets],
  );

  const address = account?.address.toString();

  function handleConnect() {
    if (!installedWallet) {
      setWalletError("No wallet detected.");
      return;
    }

    setWalletError("");
    try {
      connect(installedWallet.name);
    } catch {
      setWalletError("Unable to connect wallet.");
    }
  }

  function handleDisconnect() {
    setWalletError("");
    disconnect();
  }

  return (
    <Card className="grid gap-0 overflow-hidden md:grid-cols-[1fr_1.1fr]">
      <div className="flex items-center justify-between gap-4 border-b border-white/10 p-4 md:border-b-0 md:border-r">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-md border border-primary/25 bg-primary/10 text-primary">
            <Wallet className="size-4" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white">Wallet</p>
            <p className="truncate text-xs text-slate-500">
              {connected && address
                ? `${getWalletLabel(wallet ?? undefined)}: ${shortenAddress(address)}`
                : "Status: Not connected"}
            </p>
            {walletError ? <p className="mt-1 text-xs text-red-200">{walletError}</p> : null}
          </div>
        </div>
        <div className="flex shrink-0 items-center">
          <Button
            variant={connected ? "outline" : "secondary"}
            size="sm"
            onClick={connected ? handleDisconnect : handleConnect}
            disabled={isLoading || (!connected && !installedWallet)}
          >
            {connected ? "Disconnect" : "Connect wallet"}
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3 p-4">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/[0.06] text-slate-400">
          <Activity className="size-4" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Onchain activity</p>
          <p className="text-xs text-slate-500">No onchain events yet.</p>
        </div>
      </div>
    </Card>
  );
}
