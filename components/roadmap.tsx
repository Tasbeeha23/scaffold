"use client";

import { useState } from "react";
import { RoadmapCanvas } from "@/components/roadmap-canvas";
import type { Plan } from "@/types/plan";

export function Roadmap({ plan }: { plan: Plan }) {
  const [view, setView] = useState<"visual" | "list">("visual");
  return <section className="roadmap" aria-labelledby="roadmap-title"><div className="roadmap-heading"><div><p className="eyebrow">Your execution roadmap</p><h2 id="roadmap-title">{plan.title}</h2><p>{plan.summary}</p></div><div className="view-switcher" role="group" aria-label="Roadmap view"><button className={view === "visual" ? "active" : ""} type="button" onClick={() => setView("visual")}>Visual map</button><button className={view === "list" ? "active" : ""} type="button" onClick={() => setView("list")}>Accessible list</button></div></div>{view === "visual" ? <RoadmapCanvas plan={plan} /> : <ol className="phase-list">{plan.phases.map((phase) => <li key={phase.id} className="phase-card"><h3>{phase.title}</h3><p>{phase.description}</p><ol>{phase.tasks.map((task) => <li key={task.id}><article className="task-card"><div><h4>{task.title}</h4><p>{task.description}</p></div><dl>{task.estimatedHours !== undefined && <div><dt>Estimate</dt><dd>{task.estimatedHours} hours</dd></div>}{task.dependsOn.length > 0 && <div><dt>Depends on</dt><dd>{task.dependsOn.join(", ")}</dd></div>}</dl></article></li>)}</ol></li>)}</ol>}</section>;
}
