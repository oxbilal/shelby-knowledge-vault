"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type ShelbyFile } from "@/lib/shelby";

type PreviewDialogProps = {
  file: ShelbyFile;
  url: string;
  onClose: () => void;
};

export function PreviewDialog({ file, url, onClose }: PreviewDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur">
      <div className="flex max-h-[88vh] w-full max-w-5xl flex-col rounded-lg border border-white/10 bg-slate-950 shadow-2xl">
        <div className="flex items-center justify-between gap-4 border-b border-white/10 p-4">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{file.name}</p>
            <p className="text-xs text-slate-500">Preview</p>
          </div>
          <Button variant="ghost" size="icon" title="Close preview" onClick={onClose}>
            <X />
          </Button>
        </div>
        <div className="h-[68vh] bg-white">
          <iframe src={url} title={file.name} className="h-full w-full" />
        </div>
      </div>
    </div>
  );
}
