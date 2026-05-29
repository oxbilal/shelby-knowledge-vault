"use client";

import { Activity, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function WalletCard() {
  return (
    <Card className="grid gap-0 overflow-hidden md:grid-cols-[1fr_1.1fr]">
      <div className="flex items-center justify-between gap-4 border-b border-white/10 p-4 md:border-b-0 md:border-r">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-md border border-primary/25 bg-primary/10 text-primary">
            <Wallet className="size-4" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white">Wallet</p>
            <p className="text-xs text-slate-500">Status: Not connected</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Badge variant="outline">Coming soon</Badge>
          <Button disabled variant="secondary" size="sm">
            Connect wallet
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
