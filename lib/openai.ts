import OpenAI from "openai";

export type OpenAIAskInput = {
  fileName: string;
  question: string;
  fileText?: string;
};

const DEFAULT_OPENAI_MODEL = "gpt-4o-mini";
const MAX_FILE_TEXT_LENGTH = 12000;

function getOpenAIApiKey() {
  return process.env.OPENAI_API_KEY;
}

function getOpenAIClient() {
  const apiKey = getOpenAIApiKey();
  if (!apiKey) {
    throw new Error("OpenAI API key is not configured");
  }

  return new OpenAI({ apiKey });
}

function getOpenAIModel() {
  return process.env.OPENAI_MODEL?.trim() || DEFAULT_OPENAI_MODEL;
}

function trimFileText(fileText?: string) {
  const text = fileText?.trim();
  if (!text) {
    return "";
  }

  return text.slice(0, MAX_FILE_TEXT_LENGTH);
}

function buildPrompt({ fileName, question, fileText }: OpenAIAskInput) {
  const text = trimFileText(fileText);

  return [
    `File name: ${fileName}`,
    text ? `File text:\n${text}` : "File text: Not provided.",
    `Question: ${question}`,
  ].join("\n\n");
}

export function isOpenAIProviderSelected() {
  return process.env.AI_PROVIDER?.trim().toLowerCase() === "openai";
}

export function isOpenAIConfigured() {
  return Boolean(getOpenAIApiKey());
}

export async function askOpenAIQuestion(input: OpenAIAskInput): Promise<string> {
  const client = getOpenAIClient();
  const response = await client.responses.create({
    model: getOpenAIModel(),
    instructions:
      "You answer questions about files in Shelby Knowledge Vault. Be concise and professional. Do not invent details that are not present in the supplied file text. If file text is not provided, say that the answer is based on available preview context only.",
    input: buildPrompt(input),
    temperature: 0.2,
    max_output_tokens: 360,
  });

  const answer = response.output_text?.trim();
  if (!answer) {
    throw new Error("OpenAI response was empty");
  }

  return answer;
}
