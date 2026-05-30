import { GoogleGenAI } from "@google/genai";
import {
  AI_SYSTEM_INSTRUCTION,
  buildGroundedPrompt,
  type AIAskInput,
} from "@/lib/ai-grounding";

export const GEMINI_PREVIEW_ANSWER =
  "Based on the selected file, this preview answer will be replaced by the real AI integration.";

const GEMINI_MODEL = "gemini-2.0-flash";

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

export function isGeminiConfigured() {
  return Boolean(getGeminiApiKey());
}

export async function askGeminiQuestion(input: AIAskInput): Promise<string> {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: buildGroundedPrompt(input),
    config: {
      systemInstruction: AI_SYSTEM_INSTRUCTION,
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
