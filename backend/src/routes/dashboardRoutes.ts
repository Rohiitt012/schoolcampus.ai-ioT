import { Router } from 'express';
import { getStats } from '../controllers/dashboardController.js';
import { authenticateJWT, authorizeRoles } from '../middleware/auth.js';

const router = Router();

router.get('/stats', authenticateJWT, authorizeRoles('SUPER_ADMIN', 'ADMIN', 'TEACHER'), getStats);

export default router;
