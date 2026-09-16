import { Router } from 'express';
import { authenticateJWT, authorizeRoles } from '../middleware/auth.js';
import { prisma } from '../config/prisma.js';
import { emitAttendanceScanEvent } from '../sockets/socketManager.js';

const router = Router();

router.get('/', authenticateJWT, async (req, res, next) => {
  try {
    const { date, className, studentId } = req.query;
    const where: any = {};

    if (date) {
      const d = new Date(String(date));
      d.setHours(0, 0, 0, 0);
      const nextD = new Date(d);
      nextD.setDate(nextD.getDate() + 1);
      where.date = { gte: d, lt: nextD };
    }

    if (studentId) {
      where.studentId = String(studentId);
    }

    if (className) {
      where.student = { className: String(className) };
    }

    const attendances = await prisma.attendance.findMany({
      where,
      include: {
        student: {
          include: {
            parent: { include: { user: { select: { name: true } } } },
          },
        },
      },
      orderBy: { date: 'desc' },
      take: 100,
    });

    res.json({ success: true, data: attendances });
  } catch (err) {
    next(err);
  }
});

// RFID Attendance Scan Endpoint (Hardware + Simulator)
router.post('/scan', async (req, res, next) => {
  try {
    const { rfidCardId, deviceId } = req.body;

    if (!rfidCardId) {
      res.status(400).json({ success: false, message: 'rfidCardId is required' });
      return;
    }

    const student = await prisma.student.findUnique({
      where: { rfidCardId },
      include: {
        parent: { include: { user: true } },
        bus: true,
      },
    });

    if (!student) {
      res.status(404).json({
        success: false,
        message: `No student registered with RFID Card ID '${rfidCardId}'`,
      });
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Check existing attendance for today
    let attendance = await prisma.attendance.findFirst({
      where: {
        studentId: student.id,
        date: { gte: today, lt: tomorrow },
      },
    });

    const now = new Date();

    if (!attendance) {
      attendance = await prisma.attendance.create({
        data: {
          studentId: student.id,
          date: now,
          checkIn: now,
          deviceId: deviceId || 'GATE-01',
          status: 'PRESENT',
        },
      });
    } else {
      // Toggle checkout / boarding status if already checked in
      attendance = await prisma.attendance.update({
        where: { id: attendance.id },
        data: {
          checkOut: now,
          status: 'PRESENT',
        },
      });
    }

    // Create notification for parent if linked
    if (student.parent?.userId) {
      await prisma.notification.create({
        data: {
          userId: student.parent.userId,
          title: 'Student Gate Scan',
          message: `${student.name} tapped RFID card at device ${deviceId || 'GATE-01'} at ${now.toLocaleTimeString()}.`,
          type: 'ATTENDANCE',
        },
      });
    }

    // Emit Realtime Event
    const payload = {
      studentId: student.id,
      studentName: student.name,
      className: student.className,
      rfidCardId,
      deviceId: deviceId || 'GATE-01',
      checkInTime: attendance.checkIn,
      checkOutTime: attendance.checkOut,
      status: attendance.status,
      timestamp: now,
    };

    emitAttendanceScanEvent(payload);

    res.status(200).json({
      success: true,
      message: `RFID Scan recorded for ${student.name}`,
      student,
      attendance,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
