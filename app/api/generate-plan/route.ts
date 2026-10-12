import { AIServiceError, generatePlan } from "@/lib/ai";
import { getClientKey, isRateLimited } from "@/lib/rate-limit";
import { IdeaSchema } from "@/lib/schema";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Request body must be valid JSON" }, { status: 400 });
  }

  const input = IdeaSchema.safeParse(body);
  if (!input.success) {
    return Response.json(
      { error: input.error.issues[0]?.message ?? "Invalid request." },
      { status: 400 },
    );
  }

  if (isRateLimited(getClientKey(request))) {
    return Response.json(
      { error: "Too many roadmap requests. Please wait a minute and try again." },
      { status: 429, headers: { "Retry-After": "60" } },
    );
  }

  try {
    const plan = await generatePlan(input.data.idea);
    return Response.json(plan, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const message = error instanceof AIServiceError
      ? error.message
      : "Unable to generate a roadmap right now. Please try again.";
    const status = error instanceof AIServiceError ? error.status : 500;
    return Response.json({ error: message }, { status });
  }
}
