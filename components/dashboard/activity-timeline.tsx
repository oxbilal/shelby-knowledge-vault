"use client";

import { Activity, Bot, Download, Eye, Trash2, UploadCloud } from "lucide-react";
import { Card } from "@/components/ui/card";

export type ActivityEvent = {
  id: string;
  type: "upload" | "preview" | "download" | "ask" | "delete";
  title: string;
  detail: string;
  timestamp: string;
};

const iconMap = {
  upload: UploadCloud,
  preview: Eye,
  download: Download,
  ask: Bot,
  delete: Trash2,
};

export function ActivityTimeline({ events }: { events: ActivityEvent[] }) {
  return (
    <Card className="p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-lg font-semibold text-white">Activity</p>
          <p className="mt-1 text-sm text-slate-400">Recent activity</p>
        </div>
        <Activity className="size-5 text-primary" />
      </div>
      <div className="space-y-3">
        {events.length === 0 ? (
          <p className="rounded-lg border border-white/10 bg-white/[0.04] p-4 text-sm text-slate-500">
            No activity yet.
          </p>
        ) : (
          events.slice(0, 5).map((event) => {
            const Icon = iconMap[event.type];
            return (
              <div key={event.id} className="flex gap-2.5">
                <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/[0.06] text-primary">
                  <Icon className="size-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">{event.title}</p>
                  <p className="mt-1 text-xs text-slate-500">{event.detail}</p>
                  <p className="mt-1 text-xs text-slate-600">
                    {new Date(event.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}
