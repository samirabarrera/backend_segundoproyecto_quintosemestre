import { Router } from 'express';
import { 
  createMetric, 
  getRecentMetrics
} from '../controllers/metricasController.js';

const router = Router();

router.post('/', createMetric);
router.get('/recientes', getRecentMetrics);

export default router;