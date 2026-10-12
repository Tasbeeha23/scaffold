"use client";

import { Background, Controls, MarkerType, ReactFlow, type Edge, type Node } from "reactflow";
import "reactflow/dist/style.css";

import type { Plan } from "@/types/plan";

function buildGraph(plan: Plan): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  let row = 0;
  plan.phases.forEach((phase, phaseIndex) => {
    phase.tasks.forEach((task) => {
      nodes.push({ id: task.id, position: { x: phaseIndex * 320, y: row * 156 }, data: { label: <div className="flow-card"><span className="flow-phase">{phase.title}</span><strong>{task.title}</strong>{task.estimatedHours !== undefined && <small>{task.estimatedHours}h estimated</small>}</div> } });
      task.dependsOn.forEach((dependency) => edges.push({ id: `${dependency}-${task.id}`, source: dependency, target: task.id, markerEnd: { type: MarkerType.ArrowClosed }, animated: true }));
      row += 1;
    });
    row += 1;
  });
  return { nodes, edges };
}

export function RoadmapCanvas({ plan }: { plan: Plan }) {
  const { nodes, edges } = buildGraph(plan);
  return <div className="roadmap-canvas" aria-label="Visual roadmap showing task dependencies"><ReactFlow nodes={nodes} edges={edges} fitView minZoom={0.25} maxZoom={1.5} nodesDraggable={false} nodesConnectable={false}><Background gap={18} size={1} /><Controls showInteractive={false} /></ReactFlow></div>;
}
