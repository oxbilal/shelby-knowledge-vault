"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, DatabaseZap, FileText, Search } from "lucide-react";
import { ActivityTimeline, type ActivityEvent } from "@/components/dashboard/activity-timeline";
import { AIPanel, type ChatMessage } from "@/components/dashboard/ai-panel";
import { FileCard } from "@/components/dashboard/file-card";
import { HeaderWalletConnect } from "@/components/dashboard/wallet-connect";
import { OnchainActivityCard } from "@/components/dashboard/onchain-activity-card";
import { PreviewDialog } from "@/components/dashboard/preview-dialog";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { UploadZone } from "@/components/dashboard/upload-zone";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  deleteShelbyFile,
  getShelbyFileUrl,
  listShelbyFiles,
  uploadToShelby,
  type ShelbyFile,
} from "@/lib/shelby";
import { askFileQuestion, type AIMode } from "@/lib/ai";
import { cn } from "@/lib/utils";

type PreviewState = {
  file: ShelbyFile;
  url: string;
};

type FileFilter = "All" | "Images" | "PDFs" | "Docs";

const fileFilters: FileFilter[] = ["All", "Images", "PDFs", "Docs"];
const readableTextExtensions = [".txt", ".md", ".json", ".csv", ".tsv", ".xml", ".html"];
const maxSelectedFileContextLength = 12000;

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function hasExtension(fileName: string, extensions: string[]) {
  const normalizedName = fileName.toLowerCase();
  return extensions.some((extension) => normalizedName.endsWith(extension));
}

function hasReadableTextContext(file: Pick<ShelbyFile, "name" | "type">) {
  const type = file.type.toLowerCase();

  return (
    type.startsWith("text/") ||
    type.includes("json") ||
    type.includes("xml") ||
    type.includes("csv") ||
    hasExtension(file.name, readableTextExtensions)
  );
}

async function readSelectedFileContext(file: File) {
  if (!hasReadableTextContext(file)) {
    return undefined;
  }

  try {
    const text = (await file.text()).trim();
    return text ? text.slice(0, maxSelectedFileContextLength) : undefined;
  } catch {
    return undefined;
  }
}

function matchesFileFilter(file: ShelbyFile, filter: FileFilter) {
  const type = file.type.toLowerCase();

  if (filter === "All") {
    return true;
  }

  if (filter === "Images") {
    return type.startsWith("image/");
  }

  if (filter === "PDFs") {
    return type.includes("pdf") || hasExtension(file.name, [".pdf"]);
  }

  return (
    type.startsWith("text/") ||
    type.includes("document") ||
    type.includes("word") ||
    hasExtension(file.name, [".doc", ".docx", ".md", ".rtf", ".txt"])
  );
}

export function VaultDashboard() {
  const [files, setFiles] = useState<ShelbyFile[]>([]);
  const [selectedFileId, setSelectedFileId] = useState<string>();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FileFilter>("All");
  const [isUploading, setIsUploading] = useState(false);
  const [isAsking, setIsAsking] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activity, setActivity] = useState<ActivityEvent[]>([]);
  const [aiQueries, setAiQueries] = useState(0);
  const [aiMode, setAiMode] = useState<AIMode>("Preview");
  const [fileTextContexts, setFileTextContexts] = useState<Record<string, string>>({});
  const [preview, setPreview] = useState<PreviewState>();

  const selectedFile = useMemo(
    () => files.find((file) => file.id === selectedFileId) ?? files[0],
    [files, selectedFileId],
  );

  const fastReads = useMemo(
    () => files.reduce((total, file) => total + file.readCount, 0),
    [files],
  );

  const filteredFiles = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return files.filter((file) => {
      const matchesSearch = !query || file.name.toLowerCase().includes(query);
      return matchesSearch && matchesFileFilter(file, activeFilter);
    });
  }, [activeFilter, files, searchQuery]);

  useEffect(() => {
    void refreshFiles();
  }, []);

  async function refreshFiles() {
    const nextFiles = await listShelbyFiles();
    setFiles(nextFiles);
    setSelectedFileId((current) => {
      if (current && nextFiles.some((file) => file.id === current)) {
        return current;
      }

      return nextFiles[0]?.id;
    });
  }

  function addActivity(event: Omit<ActivityEvent, "id" | "timestamp">) {
    setActivity((current) =>
      [
        {
          ...event,
          id: createId(event.type),
          timestamp: new Date().toISOString(),
        },
        ...current,
      ].slice(0, 5),
    );
  }

  function incrementReadCount(fileId: string) {
    setFiles((current) =>
      current.map((file) =>
        file.id === fileId ? { ...file, readCount: file.readCount + 1 } : file,
      ),
    );
  }

  function handleSelectFile(file: ShelbyFile) {
    if (selectedFileId !== file.id) {
      setMessages([]);
    }

    setSelectedFileId(file.id);
  }

  async function handleUpload(uploadFiles: File[]) {
    setIsUploading(true);
    try {
      const uploaded: ShelbyFile[] = [];
      const nextContexts: Record<string, string> = {};
      for (const file of uploadFiles) {
        const uploadedFile = await uploadToShelby(file);
        const context = await readSelectedFileContext(file);

        uploaded.push(uploadedFile);
        if (context) {
          nextContexts[uploadedFile.id] = context;
        }
      }

      if (Object.keys(nextContexts).length > 0) {
        setFileTextContexts((current) => ({ ...current, ...nextContexts }));
      }

      await refreshFiles();
      setSelectedFileId(uploaded[0]?.id);
      setMessages([]);
      uploaded.forEach((file) =>
        addActivity({
          type: "upload",
          title: `Uploaded ${file.name}`,
          detail: "Upload files",
        }),
      );
    } finally {
      setIsUploading(false);
    }
  }

  async function handlePreview(file: ShelbyFile) {
    const url = await getShelbyFileUrl(file.id);
    incrementReadCount(file.id);
    setPreview({ file: { ...file, readCount: file.readCount + 1 }, url });
    await refreshFiles();
    addActivity({
      type: "preview",
      title: `Previewed ${file.name}`,
      detail: "Preview files",
    });
  }

  async function handleDownload(file: ShelbyFile) {
    const url = await getShelbyFileUrl(file.id);
    incrementReadCount(file.id);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = file.name;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    await refreshFiles();
    addActivity({
      type: "download",
      title: `Downloaded ${file.name}`,
      detail: "Download files",
    });
  }

  async function handleDelete(file: ShelbyFile) {
    await deleteShelbyFile(file.id);
    setPreview((current) => (current?.file.id === file.id ? undefined : current));
    setFileTextContexts((current) => {
      const nextContexts = { ...current };
      delete nextContexts[file.id];
      return nextContexts;
    });
    if (selectedFileId === file.id) {
      setMessages([]);
    }
    await refreshFiles();
    addActivity({
      type: "delete",
      title: `Deleted ${file.name}`,
      detail: "File removed",
    });
  }

  async function handleAsk(question: string) {
    if (!selectedFile) {
      return;
    }

    const userMessage: ChatMessage = {
      id: createId("user"),
      sender: "user",
      content: question,
    };

    setMessages((current) => [...current, userMessage]);
    setIsAsking(true);

    try {
      const result = await askFileQuestion({
        fileName: selectedFile.name,
        fileType: selectedFile.type,
        fileSize: selectedFile.size,
        readCount: selectedFile.readCount,
        question,
        fileText: fileTextContexts[selectedFile.id],
      });
      setAiMode(result.mode);
      const assistantMessage: ChatMessage = {
        id: createId("assistant"),
        sender: "assistant",
        content: result.answer,
      };
      setMessages((current) => [...current, assistantMessage]);
      setAiQueries((current) => current + 1);
      addActivity({
        type: "ask",
        title: `Asked about ${selectedFile.name}`,
        detail: question,
      });
    } finally {
      setIsAsking(false);
    }
  }

  return (
    <main className="min-h-screen">
      <div className="border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
        <div className="mx-auto grid h-16 max-w-7xl grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary">
              <DatabaseZap className="size-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Shelby Knowledge Vault</p>
            </div>
          </div>
          <Button asChild variant="ghost" size="sm" className="justify-self-center">
            <Link href="/">
              <ArrowLeft />
              Home
            </Link>
          </Button>
          <div className="justify-self-end">
            <HeaderWalletConnect />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-4 py-5 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mb-4 flex flex-col justify-between gap-4 lg:flex-row lg:items-end"
        >
          <div>
            <h1 className="text-3xl font-semibold tracking-normal text-white sm:text-4xl">
              Shelby Knowledge Vault
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
              Upload files, preview instantly, download originals, and ask AI.
            </p>
          </div>
        </motion.div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px] 2xl:grid-cols-[minmax(0,1fr)_350px]">
          <div className="space-y-4">
            <StatsCards filesStored={files.length} fastReads={fastReads} aiQueries={aiQueries} />
            <OnchainActivityCard />
            <UploadZone onFiles={handleUpload} isUploading={isUploading} />

            <section>
              <Card className="overflow-hidden">
                <div className="flex items-center justify-between gap-3 border-b border-white/10 p-4">
                  <div className="min-w-0">
                    <h2 className="text-lg font-semibold text-white">Vault Library</h2>
                    <p className="mt-1 truncate text-sm text-slate-500">
                      {selectedFile ? `Selected: ${selectedFile.name}` : "Select a file."}
                    </p>
                  </div>
                  <Badge variant="outline" className="shrink-0">
                    {filteredFiles.length}/{files.length}
                  </Badge>
                </div>

                <div className="border-b border-white/10 p-3 sm:p-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                    <div className="relative min-w-0 flex-1">
                      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
                      <Input
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
                        placeholder="Search files"
                        className="h-9 pl-9"
                      />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {fileFilters.map((filter) => (
                        <button
                          key={filter}
                          type="button"
                          onClick={() => setActiveFilter(filter)}
                          className={cn(
                            "h-9 rounded-md border border-white/10 bg-white/[0.04] px-3 text-xs font-medium text-slate-400 transition hover:bg-white/[0.08] hover:text-white",
                            activeFilter === filter &&
                              "border-primary/30 bg-primary/10 text-primary",
                          )}
                        >
                          {filter}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="max-h-[460px] overflow-y-auto p-3 sm:p-4 lg:max-h-[520px]">
                  {files.length === 0 ? (
                    <div className="rounded-lg border border-white/10 bg-white/[0.04] p-8 text-center">
                      <FileText className="mx-auto size-9 text-slate-600" />
                      <p className="mt-3 text-sm font-medium text-white">No files</p>
                      <p className="mt-1 text-sm text-slate-500">
                        Upload files to get started.
                      </p>
                    </div>
                  ) : filteredFiles.length === 0 ? (
                    <div className="rounded-lg border border-white/10 bg-white/[0.04] p-8 text-center">
                      <FileText className="mx-auto size-9 text-slate-600" />
                      <p className="mt-3 text-sm font-medium text-white">No matches</p>
                      <p className="mt-1 text-sm text-slate-500">
                        Adjust search or filters.
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-3 lg:grid-cols-2">
                      {filteredFiles.map((file) => (
                        <FileCard
                          key={file.id}
                          file={file}
                          isSelected={selectedFile?.id === file.id}
                          onSelect={handleSelectFile}
                          onPreview={handlePreview}
                          onDownload={handleDownload}
                          onDelete={handleDelete}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            </section>
          </div>

          <div className="space-y-4 xl:sticky xl:top-20 xl:self-start">
            <AIPanel
              selectedFile={selectedFile}
              aiMode={aiMode}
              messages={messages}
              isAsking={isAsking}
              onAsk={handleAsk}
            />
            <ActivityTimeline events={activity} />
          </div>
        </div>
      </div>

      {preview ? (
        <PreviewDialog file={preview.file} url={preview.url} onClose={() => setPreview(undefined)} />
      ) : null}
    </main>
  );
}
