import { Router } from 'express';
import { authenticateJWT, authorizeRoles } from '../middleware/auth.js';
import { prisma } from '../config/prisma.js';
import { emitAttendanceScanEvent } from '../sockets/socketManager.js';
import { sendWhatsAppNotification } from '../services/whatsappService.js';

const router = Router();

// GET attendance records
router.get('/', authenticateJWT, authorizeRoles('SUPER_ADMIN', 'ADMIN', 'TEACHER'), async (req, res, next) => {
  try {
    const { studentId, className, date } = req.query;

    const where: any = {};
    if (studentId) where.studentId = studentId as string;
    if (className) where.student = { className: className as string };
    if (date) {
      const targetDate = new Date(date as string);
      targetDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);
      where.date = { gte: targetDate, lt: nextDay };
    }

    const attendances = await prisma.attendance.findMany({
      where,
      include: {
        student: {
          select: { id: true, name: true, rollNumber: true, className: true, rfidCardId: true },
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
    let isCheckOut = false;

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
      isCheckOut = true;
      attendance = await prisma.attendance.update({
        where: { id: attendance.id },
        data: {
          checkOut: now,
          status: 'PRESENT',
        },
      });
    }

    // Create system notification for parent
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

    // DISPATCH INSTANT WHATSAPP ALERT TO PARENT
    let whatsappLog = null;
    if (student.parent) {
      const parentName = student.parent.user?.name || 'Parent';
      const toPhone = student.parent.phone || '9876543210';
      const waResult = await sendWhatsAppNotification({
        toPhone,
        parentName,
        studentName: student.name,
        messageType: isCheckOut ? 'GATE_EXIT' : 'GATE_ENTRY',
        details: {
          time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          rfidCardId,
        },
      });
      whatsappLog = waResult.log;
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
      whatsappLog,
      timestamp: now,
    };

    emitAttendanceScanEvent(payload);

    res.status(200).json({
      success: true,
      message: `RFID Scan recorded for ${student.name}`,
      student,
      attendance,
      whatsappLog,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
