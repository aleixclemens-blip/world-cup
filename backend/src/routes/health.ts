import { Router } from 'express';
import { checkHealth } from '../controllers/health';

const router = Router();

router.get('/health', checkHealth);

export default router;
