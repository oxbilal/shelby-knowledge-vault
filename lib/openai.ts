import OpenAI from "openai";
import {
  AI_SYSTEM_INSTRUCTION,
  buildGroundedPrompt,
  type AIAskInput,
} from "@/lib/ai-grounding";

const DEFAULT_OPENAI_MODEL = "gpt-4o-mini";

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

export function isOpenAIProviderSelected() {
  return process.env.AI_PROVIDER?.trim().toLowerCase() === "openai";
}

export function isOpenAIConfigured() {
  return Boolean(getOpenAIApiKey());
}

export async function askOpenAIQuestion(input: AIAskInput): Promise<string> {
  const client = getOpenAIClient();
  const response = await client.responses.create({
    model: getOpenAIModel(),
    instructions: AI_SYSTEM_INSTRUCTION,
    input: buildGroundedPrompt(input),
    temperature: 0.2,
    max_output_tokens: 360,
  });

  const answer = response.output_text?.trim();
  if (!answer) {
    throw new Error("OpenAI response was empty");
  }

  return answer;
}
