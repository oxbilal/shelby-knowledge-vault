"use client";

import { Activity } from "lucide-react";
import { Card } from "@/components/ui/card";

export function OnchainActivityCard() {
  return (
    <Card className="flex items-center gap-3 p-4">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/[0.06] text-slate-400">
        <Activity className="size-4" />
      </div>
      <div>
        <p className="text-sm font-semibold text-white">Onchain activity</p>
        <p className="text-xs text-slate-500">No onchain events yet.</p>
      </div>
    </Card>
  );
}
