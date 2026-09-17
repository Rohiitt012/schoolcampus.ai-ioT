import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { authenticateJWT, authorizeRoles } from '../middleware/auth.js';
import { prisma } from '../config/prisma.js';

const router = Router();

// GET all students
router.get('/', authenticateJWT, authorizeRoles('SUPER_ADMIN', 'ADMIN', 'TEACHER'), async (req, res, next) => {
  try {
    const { className, search } = req.query;

    const where: any = {};
    if (className) where.className = className as string;
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { rollNumber: { contains: search as string, mode: 'insensitive' } },
        { rfidCardId: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const students = await prisma.student.findMany({
      where,
      include: {
        parent: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
        bus: {
          select: { id: true, busNumber: true, registrationNumber: true, status: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: students });
  } catch (err) {
    next(err);
  }
});

// GET single student
router.get('/:id', authenticateJWT, authorizeRoles('SUPER_ADMIN', 'ADMIN', 'TEACHER'), async (req, res, next) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        parent: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
        bus: {
          include: {
            driver: { include: { user: { select: { name: true, email: true } } } },
            route: { include: { stops: { orderBy: { sequence: 'asc' } } } },
          },
        },
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

// POST create student with optional inline parent creation
router.post('/', authenticateJWT, authorizeRoles('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
  try {
    const { name, rollNumber, className, section, rfidCardId, parentId, busId, newParentName, newParentEmail, newParentPhone } = req.body;

    const school = await prisma.school.findFirst();
    if (!school) {
      res.status(400).json({ success: false, message: 'No school found in system' });
      return;
    }

    let finalParentId = parentId || null;

    // Inline New Parent Creation if provided
    if (!finalParentId && newParentName && newParentEmail) {
      const existingUser = await prisma.user.findUnique({ where: { email: newParentEmail } });
      if (existingUser) {
        const existingParent = await prisma.parent.findUnique({ where: { userId: existingUser.id } });
        if (existingParent) {
          finalParentId = existingParent.id;
        }
      } else {
        const hashedPassword = await bcrypt.hash('password123', 10);
        const newUser = await prisma.user.create({
          data: {
            name: newParentName,
            email: newParentEmail,
            password: hashedPassword,
            role: 'PARENT',
            schoolId: school.id,
          },
        });
        const newParent = await prisma.parent.create({
          data: {
            userId: newUser.id,
            phone: newParentPhone || '9876543210',
            schoolId: school.id,
          },
        });
        finalParentId = newParent.id;
      }
    }

    const student = await prisma.student.create({
      data: {
        name,
        rollNumber,
        className,
        section: section || 'A',
        rfidCardId,
        parentId: finalParentId,
        busId: busId || null,
        schoolId: school.id,
      },
      include: {
        parent: { include: { user: true } },
        bus: true,
      },
    });

    res.status(201).json({ success: true, data: student });
  } catch (err) {
    next(err);
  }
});

// PUT update student
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
        status: status || 'ACTIVE',
      },
      include: {
        parent: { include: { user: true } },
        bus: true,
      },
    });

    res.json({ success: true, data: student });
  } catch (err) {
    next(err);
  }
});

// DELETE deactivate student
router.delete('/:id', authenticateJWT, authorizeRoles('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    await prisma.student.delete({ where: { id } });
    res.json({ success: true, message: 'Student deactivated' });
  } catch (err) {
    next(err);
  }
});

export default router;
