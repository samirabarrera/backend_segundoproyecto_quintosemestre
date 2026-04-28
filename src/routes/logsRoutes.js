import { Router } from 'express';
import { fetchLogs } from '../controllers/logsController.js';

const router = Router();
router.get('/', fetchLogs);

export default router;
