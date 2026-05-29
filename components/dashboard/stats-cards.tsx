"use client";

import { Brain, DatabaseZap, Gauge, HardDrive } from "lucide-react";
import { Card } from "@/components/ui/card";

type StatsCardsProps = {
  filesStored: number;
  fastReads: number;
  aiQueries: number;
};

export function StatsCards({ filesStored, fastReads, aiQueries }: StatsCardsProps) {
  const stats = [
    {
      label: "Files",
      value: filesStored.toString(),
      detail: "Uploaded files",
      icon: HardDrive,
    },
    {
      label: "Fast reads",
      value: fastReads.toString(),
      detail: "Preview and download",
      icon: Gauge,
    },
    {
      label: "AI queries",
      value: aiQueries.toString(),
      detail: "Questions asked",
      icon: Brain,
    },
    {
      label: "Storage",
      value: "Hot",
      detail: "Shelby",
      icon: DatabaseZap,
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm text-slate-400">{stat.label}</p>
              <p className="mt-2 text-2xl font-semibold tracking-normal text-white">
                {stat.value}
              </p>
              <p className="mt-1 text-xs text-slate-500">{stat.detail}</p>
            </div>
            <div className="flex size-9 items-center justify-center rounded-md border border-primary/25 bg-primary/10 text-primary">
              <stat.icon className="size-4" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
