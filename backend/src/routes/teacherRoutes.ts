import { Router } from 'express';
import { authenticateJWT, authorizeRoles, AuthenticatedRequest } from '../middleware/auth.js';
import { prisma } from '../config/prisma.js';

const router = Router();

router.get('/', authenticateJWT, authorizeRoles('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
  try {
    const teachers = await prisma.teacher.findMany({
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: teachers });
  } catch (err) {
    next(err);
  }
});

router.get('/my-class', authenticateJWT, authorizeRoles('TEACHER', 'ADMIN', 'SUPER_ADMIN'), async (req: AuthenticatedRequest, res, next) => {
  try {
    const teacher = await prisma.teacher.findUnique({
      where: { userId: req.user?.userId },
    });

    const assignedClass = teacher?.assignedClass || '7-A';

    const students = await prisma.student.findMany({
      where: { className: assignedClass },
      include: {
        attendances: {
          orderBy: { date: 'desc' },
          take: 1,
        },
      },
    });

    res.json({
      success: true,
      assignedClass,
      students,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
