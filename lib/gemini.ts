import { GoogleGenAI } from "@google/genai";

export type GeminiAskInput = {
  fileName: string;
  question: string;
  fileText?: string;
};

export const GEMINI_PREVIEW_ANSWER =
  "Based on the selected file, this preview answer will be replaced by the real AI integration.";

const GEMINI_MODEL = "gemini-2.0-flash";
const MAX_FILE_TEXT_LENGTH = 12000;

// TODO: Add file text extraction/chunking before passing grounded fileText to Gemini.

function getGeminiApiKey() {
  return process.env.GEMINI_API_KEY;
}

function getGeminiClient() {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error("Gemini API key is not configured");
  }

  return new GoogleGenAI({ apiKey });
}

function trimFileText(fileText?: string) {
  const text = fileText?.trim();
  if (!text) {
    return "";
  }

  return text.slice(0, MAX_FILE_TEXT_LENGTH);
}

function buildPrompt({ fileName, question, fileText }: GeminiAskInput) {
  const text = trimFileText(fileText);

  return [
    `File name: ${fileName}`,
    text ? `File text:\n${text}` : "File text: Not provided.",
    `Question: ${question}`,
  ].join("\n\n");
}

export function isGeminiConfigured() {
  return Boolean(getGeminiApiKey());
}

export async function askGeminiQuestion(input: GeminiAskInput): Promise<string> {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: buildPrompt(input),
    config: {
      systemInstruction:
        "You answer questions about files in Shelby Knowledge Vault. Be concise and professional. Do not invent details that are not present in the supplied file text. If file text is not provided, say that the answer is based on available preview context only.",
      temperature: 0.2,
      maxOutputTokens: 360,
    },
  });

  const answer = response.text?.trim();
  if (!answer) {
    throw new Error("Gemini response was empty");
  }

  return answer;
}
