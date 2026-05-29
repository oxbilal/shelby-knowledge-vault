"use client";

import { FormEvent, useState } from "react";
import { Bot, Loader2, MessageSquare, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { type ShelbyFile } from "@/lib/shelby";
import { cn } from "@/lib/utils";

export type ChatMessage = {
  id: string;
  sender: "user" | "assistant";
  content: string;
};

type AIPanelProps = {
  selectedFile?: ShelbyFile;
  messages: ChatMessage[];
  isAsking: boolean;
  onAsk: (question: string) => Promise<void>;
};

export function AIPanel({ selectedFile, messages, isAsking, onAsk }: AIPanelProps) {
  const [question, setQuestion] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = question.trim();
    if (!trimmed || !selectedFile || isAsking) {
      return;
    }

    setQuestion("");
    await onAsk(trimmed);
  }

  return (
    <Card className="flex min-h-[440px] flex-col xl:min-h-[500px]">
      <div className="border-b border-white/10 p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-lg font-semibold text-white">Ask AI</p>
            <p className="mt-1 text-sm text-slate-400">
              {selectedFile ? selectedFile.name : "No file selected"}
            </p>
          </div>
          <div className="flex size-9 items-center justify-center rounded-md bg-secondary/15 text-secondary">
            <Bot className="size-4" />
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex h-full min-h-[170px] flex-col items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] p-5 text-center">
            <MessageSquare className="size-7 text-slate-500" />
            <p className="mt-3 text-sm font-medium text-white">
              {selectedFile ? "No questions yet" : "Select a file"}
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              {selectedFile ? "Ask AI about the selected file." : "Upload or select a file."}
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "rounded-lg border p-3 text-sm leading-6",
                message.sender === "user"
                  ? "ml-6 border-white/10 bg-white/[0.05] text-slate-200"
                  : "mr-6 border-primary/20 bg-primary/10 text-slate-100",
              )}
            >
              {message.content}
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSubmit} className="border-t border-white/10 p-4">
        <Textarea
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder={selectedFile ? "Ask about this file..." : "Select a file first"}
          className="min-h-[88px]"
          disabled={!selectedFile || isAsking}
        />
        <div className="mt-3 flex justify-end">
          <Button disabled={!selectedFile || !question.trim() || isAsking}>
            {isAsking ? <Loader2 className="animate-spin" /> : <Send />}
            Ask
          </Button>
        </div>
      </form>
    </Card>
  );
}
