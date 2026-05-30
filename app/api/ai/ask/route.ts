import { NextResponse } from "next/server";
import {
  askGeminiQuestion,
  GEMINI_PREVIEW_ANSWER,
  isGeminiConfigured,
} from "@/lib/gemini";
import {
  askOpenAIQuestion,
  isOpenAIConfigured,
  isOpenAIProviderSelected,
} from "@/lib/openai";

export const runtime = "nodejs";

type AIAskInput = {
  fileName: string;
  question: string;
  fileText?: string;
};

type AIMode = "openai" | "gemini" | "preview";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseAskInput(value: unknown): AIAskInput | null {
  if (!isRecord(value)) {
    return null;
  }

  const fileName = typeof value.fileName === "string" ? value.fileName.trim() : "";
  const question = typeof value.question === "string" ? value.question.trim() : "";
  const fileText = typeof value.fileText === "string" ? value.fileText : undefined;

  if (!fileName || !question) {
    return null;
  }

  return { fileName, question, fileText };
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown AI request error";
}

function logAIStatus(args: {
  mode: AIMode;
  openAISuccess?: boolean;
  geminiSuccess?: boolean;
  openAIError?: unknown;
  geminiError?: unknown;
}) {
  console.info("[api/ai/ask] AI mode", { mode: args.mode });

  if (typeof args.openAISuccess === "boolean") {
    console.info("[api/ai/ask] OpenAI success", { success: args.openAISuccess });
  }

  if (typeof args.geminiSuccess === "boolean") {
    console.info("[api/ai/ask] Gemini success", { success: args.geminiSuccess });
  }

  if (args.openAIError) {
    console.error("[api/ai/ask] OpenAI error", {
      message: getErrorMessage(args.openAIError),
    });
  }

  if (args.geminiError) {
    console.error("[api/ai/ask] Gemini error", {
      message: getErrorMessage(args.geminiError),
    });
  }
}

export async function POST(request: Request) {
  let input: AIAskInput | null = null;
  const wantsOpenAI = isOpenAIProviderSelected();
  const hasOpenAIKey = isOpenAIConfigured();
  const hasGeminiKey = isGeminiConfigured();

  console.info("[api/ai/ask] AI provider", {
    provider: wantsOpenAI ? "openai" : "gemini",
  });
  console.info("[api/ai/ask] hasOpenAIKey", { hasOpenAIKey });
  console.info("[api/ai/ask] hasGeminiKey", { hasGeminiKey });

  try {
    input = parseAskInput(await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!input) {
    return NextResponse.json({ error: "Missing fileName or question" }, { status: 400 });
  }

  if (wantsOpenAI && hasOpenAIKey) {
    try {
      const answer = await askOpenAIQuestion(input);
      logAIStatus({ mode: "openai", openAISuccess: true });
      return NextResponse.json({ answer, mode: "openai" });
    } catch (error) {
      logAIStatus({ mode: "gemini", openAISuccess: false, openAIError: error });
    }
  }

  if (hasGeminiKey) {
    try {
      const answer = await askGeminiQuestion(input);
      logAIStatus({ mode: "gemini", geminiSuccess: true });
      return NextResponse.json({ answer, mode: "gemini" });
    } catch (error) {
      logAIStatus({ mode: "preview", geminiSuccess: false, geminiError: error });
      return NextResponse.json({ answer: GEMINI_PREVIEW_ANSWER, mode: "preview" });
    }
  }

  logAIStatus({ mode: "preview", openAISuccess: wantsOpenAI ? false : undefined, geminiSuccess: false });
  return NextResponse.json({ answer: GEMINI_PREVIEW_ANSWER, mode: "preview" });
}
