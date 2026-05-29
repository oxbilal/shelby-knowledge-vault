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

function getMode() {
  return isGeminiConfigured() ? "gemini" : "preview";
}

export async function GET() {
  const hasGeminiKey = isGeminiConfigured();
  console.info("[api/ai/ask] hasGeminiKey", { hasGeminiKey });

  return NextResponse.json({ mode: getMode() });
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
    return NextResponse.json({ answer: GEMINI_PREVIEW_ANSWER, mode: "preview" });
  }

  try {
    const answer = await askGeminiQuestion(input);
    console.info("[api/ai/ask] Gemini request success");
    return NextResponse.json({ answer, mode: "gemini" });
  } catch (error) {
    console.error("[api/ai/ask] Gemini request failure", {
      message: getErrorMessage(error),
    });

    return NextResponse.json({ answer: GEMINI_PREVIEW_ANSWER, mode: "preview" });
  }
}
