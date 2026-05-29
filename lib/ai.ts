const AI_PREVIEW_ANSWER =
  "Based on the selected file, this preview answer will be replaced by the real AI integration.";

type AskAIResponse = {
  answer?: string;
};

export async function askFileQuestion(
  fileName: string,
  question: string,
  fileText?: string,
): Promise<string> {
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
      return payload.answer ?? AI_PREVIEW_ANSWER;
    }
  } catch {
    return AI_PREVIEW_ANSWER;
  }

  return AI_PREVIEW_ANSWER;
}
