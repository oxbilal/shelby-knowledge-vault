"use client";

import { Download, Eye, FileArchive, FileText, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatFileSize, type ShelbyFile } from "@/lib/shelby";
import { cn } from "@/lib/utils";

type FileCardProps = {
  file: ShelbyFile;
  isSelected: boolean;
  onSelect: (file: ShelbyFile) => void;
  onPreview: (file: ShelbyFile) => void;
  onDownload: (file: ShelbyFile) => void;
  onDelete: (file: ShelbyFile) => void;
};

function getFileIcon(type: string) {
  if (type.includes("zip") || type.includes("archive")) {
    return FileArchive;
  }

  return FileText;
}

export function FileCard({
  file,
  isSelected,
  onSelect,
  onPreview,
  onDownload,
  onDelete,
}: FileCardProps) {
  const Icon = getFileIcon(file.type);
  const readLabel = file.readCount === 1 ? "1 read" : `${file.readCount} reads`;

  return (
    <Card
      className={cn(
        "group cursor-pointer p-3 transition hover:border-primary/35",
        isSelected && "border-primary/35 bg-primary/[0.06]",
      )}
      onClick={() => onSelect(file)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/[0.06] text-primary">
            <Icon className="size-4" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{file.name}</p>
            <p className="text-xs text-slate-500">{formatFileSize(file.size)}</p>
          </div>
        </div>
        <Badge
          variant={isSelected ? "default" : "secondary"}
          className={cn("shrink-0 px-2 py-0.5", isSelected && "bg-primary/15")}
        >
          {isSelected ? "Selected" : "Stored"}
        </Badge>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <div className="min-w-0 truncate text-xs text-slate-500">
          {new Date(file.uploadedAt).toLocaleDateString()} - {readLabel}
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <Button
            variant="outline"
            size="icon"
            className="size-8 rounded-md [&_svg]:size-3.5"
            title="Preview file"
            onClick={(event) => {
              event.stopPropagation();
              onPreview(file);
            }}
          >
            <Eye />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-8 rounded-md [&_svg]:size-3.5"
            title="Download file"
            onClick={(event) => {
              event.stopPropagation();
              onDownload(file);
            }}
          >
            <Download />
          </Button>
          <Button
            variant="destructive"
            size="icon"
            className="size-8 rounded-md [&_svg]:size-3.5"
            title="Delete file"
            onClick={(event) => {
              event.stopPropagation();
              onDelete(file);
            }}
          >
            <Trash2 />
          </Button>
        </div>
      </div>
    </Card>
  );
}
