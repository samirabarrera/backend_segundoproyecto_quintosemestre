import { Router } from 'express';
import { 
    getNodes,
    getNodebyId,
    getStatus
} from '../controllers/nodosController.js';

const router = Router();

router.get('/', getNodes);
router.get('/distribution', getStatus);
router.get('/:id', getNodebyId);

export default router;