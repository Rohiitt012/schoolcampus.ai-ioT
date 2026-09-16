import { Router } from 'express';
import { authenticateJWT, authorizeRoles } from '../middleware/auth.js';
import { prisma } from '../config/prisma.js';

const router = Router();

router.get('/', authenticateJWT, async (req, res, next) => {
  try {
    const routes = await prisma.route.findMany({
      include: {
        stops: { orderBy: { sequence: 'asc' } },
        buses: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: routes });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', authenticateJWT, async (req, res, next) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const route = await prisma.route.findUnique({
      where: { id },
      include: {
        stops: { orderBy: { sequence: 'asc' } },
        buses: { include: { driver: { include: { user: true } } } },
      },
    });

    if (!route) {
      res.status(404).json({ success: false, message: 'Route not found' });
      return;
    }

    res.json({ success: true, data: route });
  } catch (err) {
    next(err);
  }
});

router.post('/', authenticateJWT, authorizeRoles('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
  try {
    const { name, startPoint, endPoint, stops } = req.body;
    const school = await prisma.school.findFirst();

    const route = await prisma.route.create({
      data: {
        name,
        startPoint,
        endPoint,
        schoolId: school!.id,
        stops: stops
          ? {
              create: stops.map((s: any, idx: number) => ({
                name: s.name,
                latitude: parseFloat(s.latitude),
                longitude: parseFloat(s.longitude),
                sequence: s.sequence || idx + 1,
              })),
            }
          : undefined,
      },
      include: { stops: true },
    });

    res.status(201).json({ success: true, data: route });
  } catch (err) {
    next(err);
  }
});

router.put('/:id', authenticateJWT, authorizeRoles('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { name, startPoint, endPoint } = req.body;

    const route = await prisma.route.update({
      where: { id },
      data: { name, startPoint, endPoint },
      include: { stops: true },
    });

    res.json({ success: true, data: route });
  } catch (err) {
    next(err);
  }
});

export default router;
