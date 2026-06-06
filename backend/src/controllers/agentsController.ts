import { Request, Response } from 'express';
import * as AgentModel from '../models/Agent.js';
import { executeAgent } from '../services/workflow-executor.js';

export const requireAuth = (req: Request, res: Response, next: () => void): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  next();
};

const getUserIdFromToken = (req: Request): number => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return 1;
  const token = authHeader.split(' ')[1];
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    return payload.userId || payload.id || 1;
  } catch {
    return 1;
  }
};

export const getAgents = async (req: Request, res: Response): Promise<void> => {
  try {
    const agents = await AgentModel.getAgentsByUserId(getUserIdFromToken(req));
    res.json({ success: true, data: agents });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getAgent = async (req: Request, res: Response): Promise<void> => {
  try {
    const agent = await AgentModel.getAgentById(parseInt(req.params.id), getUserIdFromToken(req));
    if (!agent) { res.status(404).json({ error: 'Agent not found' }); return; }
    res.json({ success: true, data: agent });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createAgent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, config, integrations, status } = req.body;
    if (!name || !config) { res.status(400).json({ error: 'Name and config are required' }); return; }
    const newAgent = await AgentModel.createAgent({
      user_id: getUserIdFromToken(req),
      name, description: description || '', config, integrations: integrations || [], status: status || 'draft', run_count: 0
    });
    res.status(201).json({ success: true, data: newAgent });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateAgent = async (req: Request, res: Response): Promise<void> => {
  try {
    const updated = await AgentModel.updateAgent(parseInt(req.params.id), getUserIdFromToken(req), req.body);
    if (!updated) { res.status(404).json({ error: 'Agent not found' }); return; }
    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteAgent = async (req: Request, res: Response): Promise<void> => {
  try {
    const deleted = await AgentModel.deleteAgent(parseInt(req.params.id), getUserIdFromToken(req));
    if (!deleted) { res.status(404).json({ error: 'Agent not found' }); return; }
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const runAgent = async (req: Request, res: Response): Promise<void> => {
  try {
    const agentId = parseInt(req.params.id);
    const userId = getUserIdFromToken(req);
    const agent = await AgentModel.getAgentById(agentId, userId);
    if (!agent) { res.status(404).json({ error: 'Agent not found' }); return; }
    if (agent.status !== 'active') { res.status(400).json({ error: 'Agent is not active' }); return; }
    
    const result = await executeAgent(agent, req.body.params || {});
    await AgentModel.createAgentLog({ agent_id: agentId, user_id: userId, params: req.body.params || {}, logs: result.logs, output: result.output, success: result.success });
    await AgentModel.updateAgent(agentId, userId, { run_count: (agent.run_count || 0) + 1, last_run: new Date().toISOString() });
    
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getAgentLogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const logs = await AgentModel.getAgentLogs(parseInt(req.params.id), getUserIdFromToken(req));
    res.json({ success: true, data: logs });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};