import { NextResponse } from "next/server";
import type { FileTextStatus } from "@/lib/shelby";

export const runtime = "nodejs";

type ExtractionResult = {
  extractedText?: string;
  textStatus: Exclude<FileTextStatus, "ocr-pending">;
};

const MAX_EXTRACTED_TEXT_LENGTH = 12000;

function hasExtension(fileName: string, extensions: string[]) {
  const normalizedName = fileName.toLowerCase();
  return extensions.some((extension) => normalizedName.endsWith(extension));
}

function isPdfFile(file: File) {
  return file.type.includes("pdf") || hasExtension(file.name, [".pdf"]);
}

function isOcrImage(file: File) {
  return (
    ["image/png", "image/jpeg", "image/jpg"].includes(file.type.toLowerCase()) ||
    hasExtension(file.name, [".png", ".jpg", ".jpeg"])
  );
}

function toResult(text?: string): ExtractionResult {
  const extractedText = text?.trim().slice(0, MAX_EXTRACTED_TEXT_LENGTH);

  return extractedText
    ? { extractedText, textStatus: "text-ready" }
    : { textStatus: "metadata-only" };
}

async function extractPdfText(file: File): Promise<ExtractionResult> {
  const { PDFParse } = await import("pdf-parse");
  const parser = new PDFParse({ data: Buffer.from(await file.arrayBuffer()) });

  try {
    const result = await parser.getText();
    return toResult(result.text);
  } finally {
    await parser.destroy();
  }
}

async function extractImageText(file: File): Promise<ExtractionResult> {
  const { recognize } = await import("tesseract.js");
  const image = Buffer.from(await file.arrayBuffer());
  const result = await recognize(image, "eng", {
    logger: () => undefined,
  });

  return toResult(result.data.text);
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  try {
    if (isPdfFile(file)) {
      return NextResponse.json(await extractPdfText(file));
    }

    if (isOcrImage(file)) {
      return NextResponse.json(await extractImageText(file));
    }
  } catch {
    return NextResponse.json({ textStatus: "metadata-only" satisfies FileTextStatus });
  }

  return NextResponse.json({ textStatus: "metadata-only" satisfies FileTextStatus });
}
