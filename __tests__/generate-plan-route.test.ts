import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ generatePlan: vi.fn() }));

vi.mock("../lib/ai", () => ({
  generatePlan: mocks.generatePlan,
  AIServiceError: class AIServiceError extends Error {
    constructor(message: string, public readonly status: number = 502) { super(message); }
  },
}));

import { POST } from "../app/api/generate-plan/route";
import { resetRateLimitForTests } from "../lib/rate-limit";

const validPlan = { title: "Plan", summary: "Summary", phases: [] };
const request = (body: string, ip = "127.0.0.1") => new Request("http://localhost/api/generate-plan", { method: "POST", headers: { "content-type": "application/json", "x-forwarded-for": ip }, body });

describe("POST /api/generate-plan", () => {
  beforeEach(() => { mocks.generatePlan.mockReset(); resetRateLimitForTests(); });

  it("rejects malformed JSON", async () => {
    const response = await POST(request("{"));
    expect(response.status).toBe(400);
  });

  it("rejects an invalid idea", async () => {
    const response = await POST(request(JSON.stringify({ idea: "short" })));
    expect(response.status).toBe(400);
  });

  it("returns a generated plan", async () => {
    mocks.generatePlan.mockResolvedValue(validPlan);
    const response = await POST(request(JSON.stringify({ idea: "Create a useful customer support portal" })));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(validPlan);
    expect(mocks.generatePlan).toHaveBeenCalledWith("Create a useful customer support portal");
  });

  it("maps an AI failure to a safe response", async () => {
    mocks.generatePlan.mockRejectedValue(new Error("upstream secret detail"));
    const response = await POST(request(JSON.stringify({ idea: "Create a useful customer support portal" })));
    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({ error: "Unable to generate a roadmap right now. Please try again." });
  });

  it("rate limits repeated requests", async () => {
    mocks.generatePlan.mockResolvedValue(validPlan);
    const payload = JSON.stringify({ idea: "Create a useful customer support portal" });
    for (let index = 0; index < 10; index += 1) await POST(request(payload, "limited"));
    expect((await POST(request(payload, "limited"))).status).toBe(429);
  });
});
