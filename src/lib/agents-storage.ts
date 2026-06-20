export interface Agent {
  id: string;
  name: string;
  description: string;
  status: "draft" | "active" | "paused";
  lastRun?: string;
  runCount?: number;
  integrations: string[];
  createdAt: string;
  config?: any;
}

const STORAGE_KEY = "promptcraft_agents";

export function getAgents(): Agent[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveAgents(agents: Agent[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(agents));
}

export function addAgent(agent: Agent): void {
  const agents = getAgents();
  agents.unshift(agent);
  saveAgents(agents);
}

export function updateAgent(id: string, updates: Partial<Agent>): void {
  const agents = getAgents();
  const updated = agents.map(a => a.id === id ? { ...a, ...updates } : a);
  saveAgents(updated);
}

export function deleteAgent(id: string): void {
  const agents = getAgents().filter(a => a.id !== id);
  saveAgents(agents);
}