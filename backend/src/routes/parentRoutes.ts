import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { authenticateJWT, authorizeRoles, AuthenticatedRequest } from '../middleware/auth.js';
import { prisma } from '../config/prisma.js';

const router = Router();

// GET all parents (Admin / Super Admin)
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

// POST register new Parent user & profile (Admin / Super Admin)
router.post('/', authenticateJWT, authorizeRoles('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
  try {
    const { name, email, password, phone, address } = req.body;

    if (!name || !email) {
      res.status(400).json({ success: false, message: 'Parent Name and Email are required' });
      return;
    }

    const school = await prisma.school.findFirst();
    if (!school) {
      res.status(400).json({ success: false, message: 'No school found in system' });
      return;
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ success: false, message: 'User with this email already exists' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password || 'password123', 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'PARENT',
        schoolId: school.id,
      },
    });

    const parent = await prisma.parent.create({
      data: {
        userId: user.id,
        phone: phone || '9876543210',
        address: address || '',
        schoolId: school.id,
      },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
        students: true,
      },
    });

    res.status(201).json({ success: true, data: parent });
  } catch (err) {
    next(err);
  }
});

// GET my children (Parent Role Portal)
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
