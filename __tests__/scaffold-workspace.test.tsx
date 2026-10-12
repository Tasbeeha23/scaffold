// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../components/roadmap", () => ({ Roadmap: ({ plan }: { plan: { title: string } }) => <div>Roadmap: {plan.title}</div> }));
import { ScaffoldWorkspace } from "../components/scaffold-workspace";

describe("ScaffoldWorkspace", () => {
  beforeEach(() => { cleanup(); vi.unstubAllGlobals(); });

  it("shows client validation before calling the API", async () => {
    render(<ScaffoldWorkspace />);
    fireEvent.click(screen.getByRole("button", { name: "Generate roadmap" }));
    expect((await screen.findByRole("alert")).textContent).toContain("at least 10 characters");
  });

  it("renders a returned roadmap", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ title: "Portfolio launch", summary: "A plan", phases: [] }) });
    vi.stubGlobal("fetch", fetchMock);
    render(<ScaffoldWorkspace />);
    fireEvent.change(screen.getByLabelText("Your idea"), { target: { value: "Build a portfolio for my design work" } });
    fireEvent.click(screen.getByRole("button", { name: "Generate roadmap" }));
    expect(await screen.findByText("Roadmap: Portfolio launch")).toBeTruthy();
    expect(fetchMock).toHaveBeenCalledWith("/api/generate-plan", expect.objectContaining({ method: "POST" }));
  });

  it("shows and retries an API error", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, json: async () => ({ error: "Service unavailable" }) });
    vi.stubGlobal("fetch", fetchMock);
    render(<ScaffoldWorkspace />);
    fireEvent.change(screen.getByLabelText("Your idea"), { target: { value: "Build a portfolio for my design work" } });
    fireEvent.click(screen.getByRole("button", { name: "Generate roadmap" }));
    expect(await screen.findByText("Service unavailable")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
  });
});
