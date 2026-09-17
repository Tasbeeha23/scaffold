import { z } from "zod";

import type { Plan } from "@/types/plan";

export const PlanSchema = z.object({
  title: z.string(),
  summary: z.string(),
  phases: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      description: z.string(),
      tasks: z.array(
        z.object({
          id: z.string(),
          title: z.string(),
          description: z.string(),
          estimatedHours: z.number().optional(),
          dependsOn: z.array(z.string()),
        }),
      ),
    }),
  ),
});

export type ParsePlanResult =
  | { success: true; data: Plan }
  | { success: false; error: string };

export function parsePlan(input: unknown): ParsePlanResult {
  const result = PlanSchema.safeParse(input);

  if (!result.success) {
    return {
      success: false,
      error: result.error.issues.map((issue) => issue.message).join(", "),
    };
  }

  return { success: true, data: result.data };
}
