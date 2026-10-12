"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Roadmap } from "@/components/roadmap";
import { IdeaSchema, MAX_IDEA_LENGTH, PlanSchema } from "@/lib/schema";
import type { Plan } from "@/types/plan";

type IdeaInput = { idea: string };

export function ScaffoldWorkspace() {
  const [plan, setPlan] = useState<Plan | null>(null);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [lastIdea, setLastIdea] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting }, getValues } = useForm<IdeaInput>({ resolver: zodResolver(IdeaSchema), defaultValues: { idea: "" } });
  async function generate({ idea }: IdeaInput) {
    setRequestError(null); setLastIdea(idea);
    try {
      const response = await fetch("/api/generate-plan", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ idea }) });
      const payload: unknown = await response.json();
      if (!response.ok) { const message = typeof payload === "object" && payload !== null && "error" in payload && typeof payload.error === "string" ? payload.error : "Unable to generate a roadmap right now. Please try again."; throw new Error(message); }
      const parsed = PlanSchema.safeParse(payload);
      if (!parsed.success) throw new Error("The roadmap response was incomplete. Please try again.");
      setPlan(parsed.data);
    } catch (error) { setRequestError(error instanceof Error ? error.message : "Unable to generate a roadmap right now. Please try again."); }
  }
  return <main className="workspace"><section className="hero" aria-labelledby="page-title"><p className="eyebrow">Scaffold</p><h1 id="page-title">Turn a rough idea into a clear way forward.</h1><p className="lede">Describe what you want to build. Scaffold creates a practical, dependency-aware roadmap you can act on.</p></section><section className="idea-panel" aria-labelledby="idea-title"><div><h2 id="idea-title">What are you planning?</h2><p>Include the outcome, audience, and any constraints you already know.</p></div><form onSubmit={handleSubmit(generate)} noValidate><label htmlFor="idea">Your idea</label><textarea id="idea" rows={6} placeholder="For example: a portfolio site for a freelance illustrator that turns visitors into enquiries" aria-describedby="idea-help idea-error" maxLength={MAX_IDEA_LENGTH} {...register("idea")} /><div className="form-footer"><p id="idea-help">10–{MAX_IDEA_LENGTH} characters. Your API key stays on the server.</p><button type="submit" disabled={isSubmitting}>{isSubmitting ? "Building roadmap…" : "Generate roadmap"}</button></div>{errors.idea && <p id="idea-error" className="form-error" role="alert">{errors.idea.message}</p>}</form>{requestError && <div className="request-error" role="alert"><p>{requestError}</p><button type="button" onClick={() => generate({ idea: lastIdea ?? getValues("idea") })} disabled={isSubmitting}>Try again</button></div>}</section>{plan ? <Roadmap plan={plan} /> : <section className="empty-state" aria-live="polite"><span>01</span><p>Your roadmap will appear here, organized into phases and connected by dependencies.</p></section>}</main>;
}
