import { z } from "zod";

import type { Plan } from "@/types/plan";

export const MAX_IDEA_LENGTH = 1_200;

export const IdeaSchema = z.object({
  idea: z
    .string()
    .trim()
    .min(10, "Describe your idea in at least 10 characters.")
    .max(MAX_IDEA_LENGTH, `Keep your idea under ${MAX_IDEA_LENGTH} characters.`),
});

const TaskSchema = z.object({
  id: z.string().trim().min(1),
  title: z.string().trim().min(1),
  description: z.string().trim().min(1),
  estimatedHours: z.number().nonnegative().optional(),
  dependsOn: z.array(z.string().trim().min(1)),
});

export const PlanSchema = z.object({
  title: z.string(),
  summary: z.string(),
  phases: z.array(
    z.object({
      id: z.string().trim().min(1),
      title: z.string().trim().min(1),
      description: z.string().trim().min(1),
      tasks: z.array(TaskSchema),
    }),
  ),
}).superRefine((plan, context) => {
  const phaseIds = new Set<string>();
  const taskIds = new Set<string>();
  const tasks = plan.phases.flatMap((phase) => phase.tasks);

  plan.phases.forEach((phase, phaseIndex) => {
    if (phaseIds.has(phase.id)) {
      context.addIssue({ code: "custom", path: ["phases", phaseIndex, "id"], message: "Phase IDs must be unique." });
    }
    phaseIds.add(phase.id);
  });

  tasks.forEach((task) => {
    if (taskIds.has(task.id)) {
      context.addIssue({ code: "custom", message: `Task ID \"${task.id}\" must be unique.` });
    }
    taskIds.add(task.id);
  });

  const dependencies = new Map(tasks.map((task) => [task.id, task.dependsOn]));
  tasks.forEach((task) => {
    task.dependsOn.forEach((dependency) => {
      if (!taskIds.has(dependency)) {
        context.addIssue({ code: "custom", message: `Task \"${task.id}\" depends on unknown task \"${dependency}\".` });
      }
    });
  });

  const visiting = new Set<string>();
  const visited = new Set<string>();
  const hasCycle = (id: string): boolean => {
    if (visiting.has(id)) return true;
    if (visited.has(id)) return false;
    visiting.add(id);
    const cycle = (dependencies.get(id) ?? []).some((dependency) =>
      dependencies.has(dependency) && hasCycle(dependency),
    );
    visiting.delete(id);
    visited.add(id);
    return cycle;
  };

  if (tasks.some((task) => hasCycle(task.id))) {
    context.addIssue({ code: "custom", message: "Task dependencies cannot contain a cycle." });
  }
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
