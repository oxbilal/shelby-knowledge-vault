"use client";

import { ChangeEvent, DragEvent, useRef, useState } from "react";
import { FileUp, Loader2, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type UploadZoneProps = {
  onFiles: (files: File[]) => void;
  isUploading: boolean;
  statusMessage?: string;
};

export function UploadZone({ onFiles, isUploading, statusMessage }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  function handleFiles(fileList: FileList | null) {
    if (!fileList?.length) {
      return;
    }

    onFiles(Array.from(fileList));
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    handleFiles(event.dataTransfer.files);
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    handleFiles(event.target.files);
    event.target.value = "";
  }

  return (
    <div
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={cn(
        "rounded-lg border border-dashed border-white/15 bg-white/[0.04] p-3 transition",
        isDragging && "border-primary bg-primary/10 shadow-glow",
      )}
    >
      <input ref={inputRef} type="file" className="hidden" multiple onChange={handleInputChange} />
      <div className="flex flex-col items-center justify-between gap-3 text-center sm:flex-row sm:text-left">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-primary/25 bg-primary/10 text-primary">
          {isUploading ? <Loader2 className="size-5 animate-spin" /> : <UploadCloud className="size-5" />}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-semibold text-white">Upload files</h2>
          <p className="mt-0.5 text-sm leading-6 text-slate-400">
            {statusMessage ?? "Drop files here or choose files."}
          </p>
        </div>
        <Button
          className="shrink-0"
          variant="secondary"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
        >
          <FileUp />
          Choose files
        </Button>
      </div>
    </div>
  );
}
