export async function askFileQuestion(_fileId: string, _question: string): Promise<string> {
  // TODO: Replace this deterministic mock with Gemini API retrieval + generation.
  // Expected real flow: fetch file text/chunks from Shelby hot storage, send relevant
  // context to Gemini, and return cited answers grounded in the user's files.
  await new Promise((resolve) => setTimeout(resolve, 650));

  return "Based on the selected file, this preview answer will be replaced by the real AI integration.";
}
