import { Router } from 'express';
import { authenticateJWT, authorizeRoles } from '../middleware/auth.js';
import { prisma } from '../config/prisma.js';

const router = Router();

router.get('/', authenticateJWT, async (req, res, next) => {
  try {
    const { search, className, status } = req.query;
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: String(search) } },
        { rollNumber: { contains: String(search) } },
        { rfidCardId: { contains: String(search) } },
      ];
    }

    if (className) where.className = String(className);
    if (status) where.status = String(status);

    const students = await prisma.student.findMany({
      where,
      include: {
        parent: { include: { user: { select: { name: true, email: true } } } },
        bus: true,
        school: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: students });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', authenticateJWT, async (req, res, next) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        parent: { include: { user: true } },
        bus: { include: { driver: { include: { user: true } }, route: true } },
        attendances: { orderBy: { date: 'desc' }, take: 10 },
        alerts: { orderBy: { createdAt: 'desc' }, take: 5 },
      },
    });

    if (!student) {
      res.status(404).json({ success: false, message: 'Student not found' });
      return;
    }

    res.json({ success: true, data: student });
  } catch (err) {
    next(err);
  }
});

router.post('/', authenticateJWT, authorizeRoles('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
  try {
    const { name, rollNumber, className, section, rfidCardId, parentId, busId } = req.body;

    const school = await prisma.school.findFirst();
    if (!school) {
      res.status(400).json({ success: false, message: 'No school found in system' });
      return;
    }

    const student = await prisma.student.create({
      data: {
        name,
        rollNumber,
        className,
        section: section || 'A',
        rfidCardId,
        parentId: parentId || null,
        busId: busId || null,
        schoolId: school.id,
      },
    });

    res.status(201).json({ success: true, data: student });
  } catch (err) {
    next(err);
  }
});

router.put('/:id', authenticateJWT, authorizeRoles('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { name, rollNumber, className, section, rfidCardId, parentId, busId, status } = req.body;
    const student = await prisma.student.update({
      where: { id },
      data: {
        name,
        rollNumber,
        className,
        section,
        rfidCardId,
        parentId: parentId || null,
        busId: busId || null,
        status,
      },
    });

    res.json({ success: true, data: student });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', authenticateJWT, authorizeRoles('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    await prisma.student.delete({ where: { id } });
    res.json({ success: true, message: 'Student deleted successfully' });
  } catch (err) {
    next(err);
  }
});

export default router;
