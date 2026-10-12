import { GoogleGenerativeAI } from "@google/generative-ai";

import { parsePlan } from "@/lib/schema";
import type { Plan } from "@/types/plan";

const modelName = process.env.GEMINI_MODEL ?? "gemini-1.5-flash";
const REQUEST_TIMEOUT_MS = 25_000;

export class AIServiceError extends Error {
  constructor(message: string, public readonly status: 502 | 503 | 504 = 502) {
    super(message);
    this.name = "AIServiceError";
  }
}

function createPrompt(idea: string, fixJson = false) {
  const formattingInstruction = fixJson
    ? "Your previous response was invalid. Correct the JSON formatting and structure."
    : "";

  return `Turn the following idea into a structured, step-by-step execution roadmap: ${idea}

Return a JSON object with this exact shape:
{
  "title": "string",
  "summary": "string",
  "phases": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "tasks": [
        {
          "id": "string",
          "title": "string",
          "description": "string",
          "estimatedHours": "optional number",
          "dependsOn": ["task id string"]
        }
      ]
    }
  ]
}

Respond with ONLY valid JSON matching this exact shape. Do not include markdown, code fences, or commentary.
${formattingInstruction}`;
}

export function parsePlanResponse(rawText: string): unknown {
  const jsonText = rawText
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();

  try {
    return JSON.parse(jsonText);
  } catch {
    return undefined;
  }
}

async function requestPlan(prompt: string): Promise<unknown> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new AIServiceError("The AI service is not configured.", 503);
  }

  const client = new GoogleGenerativeAI(apiKey);
  const model = client.getGenerativeModel({ model: modelName });
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    const result = await Promise.race([
      model.generateContent(prompt),
      new Promise<never>((_, reject) => {
        timeout = setTimeout(
          () => reject(new AIServiceError("The AI service took too long to respond.", 504)),
          REQUEST_TIMEOUT_MS,
        );
      }),
    ]);

    return parsePlanResponse(result.response.text());
  } catch (error) {
    if (error instanceof AIServiceError) throw error;
    throw new AIServiceError("Unable to generate a roadmap right now. Please try again.");
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

export async function generatePlan(idea: string): Promise<Plan> {
  const firstAttempt = parsePlan(await requestPlan(createPrompt(idea)));

  if (firstAttempt.success) {
    return firstAttempt.data;
  }

  const retryAttempt = parsePlan(
    await requestPlan(createPrompt(idea, true)),
  );

  if (retryAttempt.success) {
    return retryAttempt.data;
  }

  throw new AIServiceError("The AI returned an unusable roadmap. Please try again.");
}
