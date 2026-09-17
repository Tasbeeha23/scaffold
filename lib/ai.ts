import { GoogleGenerativeAI } from "@google/generative-ai";

import { parsePlan } from "@/lib/schema";
import type { Plan } from "@/types/plan";

const modelName = "gemini-1.5-flash";

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

async function requestPlan(prompt: string): Promise<unknown> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const client = new GoogleGenerativeAI(apiKey);
  const model = client.getGenerativeModel({ model: modelName });
  const result = await model.generateContent(prompt);

  try {
    return JSON.parse(result.response.text());
  } catch {
    return undefined;
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

  throw new Error("AI returned invalid plan structure");
}
