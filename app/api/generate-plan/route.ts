import { generatePlan } from "@/lib/ai";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Request body must be valid JSON" }, { status: 400 });
  }

  const idea =
    typeof body === "object" && body !== null && "idea" in body
      ? body.idea
      : undefined;

  if (typeof idea !== "string" || idea.trim().length === 0) {
    return Response.json(
      { error: "idea must be a non-empty string" },
      { status: 400 },
    );
  }

  try {
    const plan = await generatePlan(idea.trim());
    return Response.json(plan);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to generate plan";
    return Response.json({ error: message }, { status: 500 });
  }
}
