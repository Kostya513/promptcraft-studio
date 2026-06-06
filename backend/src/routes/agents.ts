import { Router, Request, Response } from 'express';
import * as agentsController from '../controllers/agentsController.js';

const router = Router();
router.use(agentsController.requireAuth);

router.get('/', agentsController.getAgents);
router.get('/test', (_req: Request, res: Response) => { res.json({ status: 'ok' }); });
router.get('/:id', agentsController.getAgent);
router.post('/', agentsController.createAgent);
router.put('/:id', agentsController.updateAgent);
router.delete('/:id', agentsController.deleteAgent);
router.post('/:id/run', agentsController.runAgent);
router.get('/:id/logs', agentsController.getAgentLogs);

export default router;