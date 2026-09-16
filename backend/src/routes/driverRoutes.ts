import { Router } from 'express';
import { authenticateJWT, authorizeRoles, AuthenticatedRequest } from '../middleware/auth.js';
import { prisma } from '../config/prisma.js';

const router = Router();

router.get('/', authenticateJWT, authorizeRoles('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
  try {
    const drivers = await prisma.driver.findMany({
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
        bus: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: drivers });
  } catch (err) {
    next(err);
  }
});

router.get('/my-bus', authenticateJWT, authorizeRoles('DRIVER'), async (req: AuthenticatedRequest, res, next) => {
  try {
    const driver = await prisma.driver.findUnique({
      where: { userId: req.user?.userId },
      include: {
        bus: {
          include: {
            route: {
              include: {
                stops: { orderBy: { sequence: 'asc' } },
              },
            },
            locations: { orderBy: { timestamp: 'desc' }, take: 1 },
            alerts: { orderBy: { createdAt: 'desc' }, take: 5 },
          },
        },
      },
    });

    if (!driver || !driver.bus) {
      res.status(404).json({ success: false, message: 'Assigned bus not found for driver' });
      return;
    }

    res.json({ success: true, data: driver.bus });
  } catch (err) {
    next(err);
  }
});

export default router;
