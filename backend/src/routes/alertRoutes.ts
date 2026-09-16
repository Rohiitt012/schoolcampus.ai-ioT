import { Router } from 'express';
import { authenticateJWT, authorizeRoles } from '../middleware/auth.js';
import { prisma } from '../config/prisma.js';

const router = Router();

router.get('/', authenticateJWT, async (req, res, next) => {
  try {
    const { resolved, severity, type } = req.query;
    const where: any = {};

    if (resolved !== undefined) {
      where.resolved = resolved === 'true';
    }
    if (severity) where.severity = String(severity);
    if (type) where.type = String(type);

    const alerts = await prisma.alert.findMany({
      where,
      include: {
        bus: { select: { id: true, busNumber: true, registrationNumber: true } },
        student: { select: { id: true, name: true, className: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: alerts });
  } catch (err) {
    next(err);
  }
});

router.put('/:id/resolve', authenticateJWT, authorizeRoles('SUPER_ADMIN', 'ADMIN', 'TEACHER'), async (req, res, next) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const alert = await prisma.alert.update({
      where: { id },
      data: { resolved: true },
    });

    res.json({ success: true, message: 'Alert marked as resolved', data: alert });
  } catch (err) {
    next(err);
  }
});

export default router;
