export interface Task {
  id: string;
  title: string;
  description: string;
  estimatedHours?: number;
  dependsOn: string[];
}

export interface Phase {
  id: string;
  title: string;
  description: string;
  tasks: Task[];
}

export interface Plan {
  title: string;
  summary: string;
  phases: Phase[];
}
