import { Router } from 'express';
import { authenticateJWT, authorizeRoles, AuthenticatedRequest } from '../middleware/auth.js';
import { prisma } from '../config/prisma.js';

const router = Router();

router.get('/', authenticateJWT, authorizeRoles('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
  try {
    const parents = await prisma.parent.findMany({
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
        students: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: parents });
  } catch (err) {
    next(err);
  }
});

router.get('/my-children', authenticateJWT, authorizeRoles('PARENT'), async (req: AuthenticatedRequest, res, next) => {
  try {
    const parent = await prisma.parent.findUnique({
      where: { userId: req.user?.userId },
      include: {
        students: {
          include: {
            bus: {
              include: {
                driver: { include: { user: { select: { name: true, email: true } } } },
                route: { include: { stops: { orderBy: { sequence: 'asc' } } } },
                locations: { orderBy: { timestamp: 'desc' }, take: 1 },
              },
            },
            attendances: { orderBy: { date: 'desc' }, take: 10 },
            alerts: { orderBy: { createdAt: 'desc' }, take: 5 },
          },
        },
      },
    });

    if (!parent) {
      res.status(404).json({ success: false, message: 'Parent profile not found' });
      return;
    }

    res.json({ success: true, data: parent.students });
  } catch (err) {
    next(err);
  }
});

export default router;
