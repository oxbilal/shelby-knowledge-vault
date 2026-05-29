import { NextResponse } from "next/server";
import {
  askGeminiQuestion,
  GEMINI_PREVIEW_ANSWER,
  isGeminiConfigured,
  type GeminiAskInput,
} from "@/lib/gemini";

export const runtime = "nodejs";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseAskInput(value: unknown): GeminiAskInput | null {
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
  return error instanceof Error ? error.message : "Unknown Gemini request error";
}

function logAIStatus(args: { mode: "gemini" | "preview"; geminiSuccess: boolean; error?: unknown }) {
  console.info("[api/ai/ask] AI mode", { mode: args.mode });
  console.info("[api/ai/ask] Gemini success", { success: args.geminiSuccess });

  if (args.error) {
    console.error("[api/ai/ask] Gemini error", {
      message: getErrorMessage(args.error),
    });
  }
}

export async function POST(request: Request) {
  let input: GeminiAskInput | null = null;
  const hasGeminiKey = isGeminiConfigured();

  console.info("[api/ai/ask] hasGeminiKey", { hasGeminiKey });

  try {
    input = parseAskInput(await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!input) {
    return NextResponse.json({ error: "Missing fileName or question" }, { status: 400 });
  }

  if (!hasGeminiKey) {
    logAIStatus({ mode: "preview", geminiSuccess: false });
    return NextResponse.json({ answer: GEMINI_PREVIEW_ANSWER, mode: "preview" });
  }

  try {
    const answer = await askGeminiQuestion(input);
    logAIStatus({ mode: "gemini", geminiSuccess: true });
    return NextResponse.json({ answer, mode: "gemini" });
  } catch (error) {
    logAIStatus({ mode: "preview", geminiSuccess: false, error });
    return NextResponse.json({ answer: GEMINI_PREVIEW_ANSWER, mode: "preview" });
  }
}
