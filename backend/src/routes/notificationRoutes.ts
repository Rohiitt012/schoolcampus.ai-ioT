import { Router } from 'express';
import { authenticateJWT, AuthenticatedRequest } from '../middleware/auth.js';
import { prisma } from '../config/prisma.js';

const router = Router();

router.get('/', authenticateJWT, async (req: AuthenticatedRequest, res, next) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user?.userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    res.json({ success: true, data: notifications });
  } catch (err) {
    next(err);
  }
});

router.put('/:id/read', authenticateJWT, async (req: AuthenticatedRequest, res, next) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const notification = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    res.json({ success: true, data: notification });
  } catch (err) {
    next(err);
  }
});

export default router;
