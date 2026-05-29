const AI_PREVIEW_ANSWER =
  "Based on the selected file, this preview answer will be replaced by the real AI integration.";

export type AIMode = "Gemini" | "Preview";

type AskAIResponse = {
  answer?: string;
  mode?: string;
};

function normalizeMode(mode?: string): AIMode {
  return mode === "gemini" ? "Gemini" : "Preview";
}

export async function getAIMode(): Promise<AIMode> {
  try {
    const response = await fetch("/api/ai/ask", {
      method: "GET",
      cache: "no-store",
    });

    if (response.ok) {
      const payload = (await response.json()) as AskAIResponse;
      return normalizeMode(payload.mode);
    }
  } catch {
    return "Preview";
  }

  return "Preview";
}

export async function askFileQuestion(
  fileName: string,
  question: string,
  fileText?: string,
): Promise<{ answer: string; mode: AIMode }> {
  try {
    const response = await fetch("/api/ai/ask", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fileName, question, fileText }),
    });

    if (response.ok) {
      const payload = (await response.json()) as AskAIResponse;
      return {
        answer: payload.answer ?? AI_PREVIEW_ANSWER,
        mode: normalizeMode(payload.mode),
      };
    }
  } catch {
    return { answer: AI_PREVIEW_ANSWER, mode: "Preview" };
  }

  return { answer: AI_PREVIEW_ANSWER, mode: "Preview" };
}
