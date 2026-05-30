export type AIMode = "OpenAI" | "Gemini" | "Preview";

export type AskFileQuestionInput = {
  fileName: string;
  fileType: string;
  fileSize: number;
  readCount: number;
  question: string;
  fileText?: string;
};

type AskAIResponse = {
  answer?: string;
  mode?: string;
};

function normalizeMode(mode?: string): AIMode {
  if (mode === "openai") {
    return "OpenAI";
  }

  return mode === "gemini" ? "Gemini" : "Preview";
}

function createClientPreviewAnswer(input: AskFileQuestionInput) {
  return `Preview mode. I can only use metadata for ${input.fileName}. Upload readable text or add PDF parsing to answer from file content.`;
}

export async function askFileQuestion(
  input: AskFileQuestionInput,
): Promise<{ answer: string; mode: AIMode }> {
  try {
    const response = await fetch("/api/ai/ask", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    });

    if (response.ok) {
      const payload = (await response.json()) as AskAIResponse;
      return {
        answer: payload.answer ?? createClientPreviewAnswer(input),
        mode: normalizeMode(payload.mode),
      };
    }
  } catch {
    return { answer: createClientPreviewAnswer(input), mode: "Preview" };
  }

  return { answer: createClientPreviewAnswer(input), mode: "Preview" };
}
