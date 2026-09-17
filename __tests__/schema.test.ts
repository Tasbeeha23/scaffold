import { describe, expect, it } from "vitest";

import { parsePlan } from "../lib/schema";

describe("parsePlan", () => {
  it("succeeds for a valid plan", () => {
    const result = parsePlan({
      title: "Launch a portfolio",
      summary: "A practical plan for publishing a portfolio site.",
      phases: [
        {
          id: "phase-1",
          title: "Plan",
          description: "Define the site scope.",
          tasks: [
            {
              id: "task-1",
              title: "Choose projects",
              description: "Select the work to showcase.",
              estimatedHours: 2,
              dependsOn: [],
            },
          ],
        },
      ],
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.phases[0].tasks[0].estimatedHours).toBe(2);
    }
  });

  it("fails for an object with missing required fields", () => {
    const result = parsePlan({
      title: "Incomplete plan",
      phases: [],
    });

    expect(result).toMatchObject({ success: false });
  });

  it.each(["not a plan", null])("fails gracefully for invalid input: %p", (input) => {
    expect(() => parsePlan(input)).not.toThrow();
    expect(parsePlan(input)).toMatchObject({ success: false });
  });
});
