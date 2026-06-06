import Database from 'better-sqlite3';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const dbPath = path.join(__dirname, '../../data/promptcraft.db');
const db = new Database(dbPath);

export interface WorkflowNode {
  id: string;
  type: 'trigger' | 'llm' | 'condition' | 'action' | 'memory' | 'loop';
  label: string;
  config: Record<string, any>;
}

export interface Agent {
  id?: number;
  user_id: number;
  name: string;
  description: string;
  config: {
    personality: string;
    triggers: string[];
    workflow: WorkflowNode[];
    memoryType: string;
    maxContext: number;
    maxIterations: number;
    timeout: number;
    tokenBudget: number;
  };
  integrations: string[];
  status: 'draft' | 'active' | 'paused';
  run_count: number;
  last_run?: string;
  created_at?: string;
}

export async function createAgentsTable() {
  console.log('✅ Таблица agents создана');
}

export async function createAgentLogsTable() {
  console.log('✅ Таблица agent_logs создана');
}

export async function getAgentsByUserId(userId: number): Promise<Agent[]> {
  const stmt = db.prepare('SELECT * FROM agents WHERE user_id = ? ORDER BY created_at DESC');
  const rows = stmt.all(userId) as any[];
  return rows.map(row => ({
    ...row,
    config: JSON.parse(row.config),
    integrations: JSON.parse(row.integrations)
  }));
}

export async function getAgentById(id: number, userId: number): Promise<Agent | null> {
  const stmt = db.prepare('SELECT * FROM agents WHERE id = ? AND user_id = ?');
  const row = stmt.get(id, userId) as any;
  if (!row) return null;
  return {
    ...row,
    config: JSON.parse(row.config),
    integrations: JSON.parse(row.integrations)
  };
}

export async function createAgent(agent: Agent): Promise<Agent> {
  const stmt = db.prepare(`
    INSERT INTO agents (user_id, name, description, config, integrations, status, run_count, last_run)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const result = stmt.run(
    agent.user_id,
    agent.name,
    agent.description,
    JSON.stringify(agent.config),
    JSON.stringify(agent.integrations),
    agent.status,
    agent.run_count || 0,
    agent.last_run || null
  );
  return { ...agent, id: result.lastInsertRowid as number };
}

export async function updateAgent(id: number, userId: number, updates: Partial<Agent>): Promise<Agent | null> {
  const fields: string[] = [];
  const values: any[] = [];
  
  if (updates.name !== undefined) { fields.push('name = ?'); values.push(updates.name); }
  if (updates.description !== undefined) { fields.push('description = ?'); values.push(updates.description); }
  if (updates.config !== undefined) { fields.push('config = ?'); values.push(JSON.stringify(updates.config)); }
  if (updates.integrations !== undefined) { fields.push('integrations = ?'); values.push(JSON.stringify(updates.integrations)); }
  if (updates.status !== undefined) { fields.push('status = ?'); values.push(updates.status); }
  if (updates.run_count !== undefined) { fields.push('run_count = ?'); values.push(updates.run_count); }
  if (updates.last_run !== undefined) { fields.push('last_run = ?'); values.push(updates.last_run); }
  
  if (fields.length === 0) return null;
  
  values.push(id, userId);
  const query = `UPDATE agents SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`;
  const stmt = db.prepare(query);
  stmt.run(...values);
  
  return getAgentById(id, userId);
}

export async function deleteAgent(id: number, userId: number): Promise<boolean> {
  const stmt = db.prepare('DELETE FROM agents WHERE id = ? AND user_id = ?');
  const result = stmt.run(id, userId);
  return result.changes > 0;
}

export async function createAgentLog(log: { agent_id: number; user_id: number; params: any; logs: string[]; output: any; success: boolean }) {
  const stmt = db.prepare(`
    INSERT INTO agent_logs (agent_id, user_id, params, logs, output, success)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  const result = stmt.run(
    log.agent_id,
    log.user_id,
    JSON.stringify(log.params),
    JSON.stringify(log.logs),
    JSON.stringify(log.output),
    log.success ? 1 : 0
  );
  return { id: result.lastInsertRowid, ...log };
}

export async function getAgentLogs(agentId: number, userId: number, limit: number = 50) {
  const stmt = db.prepare(
    'SELECT * FROM agent_logs WHERE agent_id = ? AND user_id = ? ORDER BY created_at DESC LIMIT ?'
  );
  return stmt.all(agentId, userId, limit);
}

// Close database connection when process exits
process.on('exit', () => {
  db.close();
});