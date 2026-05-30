export type AIAskInput = {
  fileName: string;
  fileType: string;
  fileSize: number;
  readCount: number;
  question: string;
  fileText?: string;
};

const MAX_FILE_TEXT_LENGTH = 12000;

export const AI_SYSTEM_INSTRUCTION =
  "You answer questions about files in Shelby Knowledge Vault. Use only the supplied file metadata and selected file context. Keep responses concise and product-ready. If selected file context is not available, clearly say you can only use metadata, then ask the user to upload readable text or add PDF parsing later. Do not invent file contents.";

function trimFileText(fileText?: string) {
  const text = fileText?.trim();
  if (!text) {
    return "";
  }

  return text.slice(0, MAX_FILE_TEXT_LENGTH);
}

function formatFileSize(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB"];
  const unitIndex = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** unitIndex;

  return `${value.toFixed(value >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

export function buildGroundedPrompt(input: AIAskInput) {
  const text = trimFileText(input.fileText);

  return [
    "Selected file metadata:",
    `- Name: ${input.fileName}`,
    `- Type: ${input.fileType || "Unknown"}`,
    `- Size: ${formatFileSize(input.fileSize)} (${input.fileSize} bytes)`,
    `- Read count: ${input.readCount}`,
    "",
    text
      ? `Selected file context:\n${text}`
      : "Selected file context: Not available.",
    "",
    `Question: ${input.question}`,
  ].join("\n");
}

export function createPreviewAnswer(input: AIAskInput) {
  return `Preview mode. I can only use metadata for ${input.fileName}. Upload readable text or add PDF parsing to answer from file content.`;
}
