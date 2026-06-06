import { Router } from 'express';
import * as aiKeysController from '../controllers/aiKeysController.js';
import { requireAuth } from '../controllers/agentsController.js';

const router = Router();
router.use(requireAuth);

router.get('/providers', aiKeysController.getProviders);
router.get('/', aiKeysController.getUserKeys);
router.post('/', aiKeysController.saveKey);
router.delete('/:providerId', aiKeysController.deleteKey);
router.post('/:providerId/test', aiKeysController.testKey);
router.put('/:providerId/default', aiKeysController.setDefault);

export default router;