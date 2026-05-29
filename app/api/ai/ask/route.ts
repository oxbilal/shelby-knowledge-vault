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

export async function POST(request: Request) {
  let input: GeminiAskInput | null = null;

  try {
    input = parseAskInput(await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!input) {
    return NextResponse.json({ error: "Missing fileName or question" }, { status: 400 });
  }

  if (!isGeminiConfigured()) {
    return NextResponse.json({ answer: GEMINI_PREVIEW_ANSWER, mode: "preview" });
  }

  try {
    const answer = await askGeminiQuestion(input);
    return NextResponse.json({ answer });
  } catch {
    return NextResponse.json({ answer: GEMINI_PREVIEW_ANSWER, mode: "preview" });
  }
}
