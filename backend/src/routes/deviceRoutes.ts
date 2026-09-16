import { Router } from 'express';
import { authenticateJWT, authorizeRoles, AuthenticatedRequest } from '../middleware/auth.js';
import { authenticateDevice, DeviceAuthenticatedRequest } from '../middleware/deviceAuth.js';
import { prisma } from '../config/prisma.js';

const router = Router();

// GET /api/devices - List devices
router.get('/', authenticateJWT, authorizeRoles('SUPER_ADMIN', 'ADMIN'), async (req: AuthenticatedRequest, res, next) => {
  try {
    const schoolId = req.user?.schoolId;
    const whereClause = schoolId ? { schoolId } : {};

    const devices = await prisma.device.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });

    const credentials = await prisma.deviceCredential.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: { devices, credentials } });
  } catch (err) {
    next(err);
  }
});

// POST /api/devices - Register device
router.post('/', authenticateJWT, authorizeRoles('SUPER_ADMIN', 'ADMIN'), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { deviceId, type, token, location } = req.body;
    const schoolId = req.user?.schoolId;

    if (!schoolId) {
      return res.status(400).json({ success: false, error: 'School ID required' });
    }

    const device = await prisma.device.create({
      data: {
        deviceId,
        type: type || 'GATEWAY',
        schoolId,
        status: 'ONLINE',
        lastSeen: new Date(),
      },
    });

    // Create device authentication credential
    const credential = await prisma.deviceCredential.create({
      data: {
        deviceId,
        token: token || `devtok_${deviceId.toLowerCase()}_${Math.random().toString(36).substring(7)}`,
        deviceType: type || 'IOT_SENSOR',
        schoolId,
        location: location || 'Campus',
        status: 'ACTIVE',
      },
    });

    res.status(201).json({ success: true, data: { device, credential } });
  } catch (err) {
    next(err);
  }
});

// POST /api/devices/heartbeat - Telemetry & Device Heartbeat
router.post('/heartbeat', authenticateDevice, async (req: DeviceAuthenticatedRequest, res, next) => {
  try {
    const { deviceId, status, type, battery, firmwareVersion } = req.body;

    const targetDeviceId = req.deviceCredential?.deviceId || deviceId;

    if (!targetDeviceId) {
      return res.status(400).json({ success: false, error: 'deviceId required' });
    }

    // Upsert device
    const school = await prisma.school.findFirst();
    const device = await prisma.device.upsert({
      where: { deviceId: targetDeviceId },
      update: {
        status: status || 'ONLINE',
        lastSeen: new Date(),
      },
      create: {
        deviceId: targetDeviceId,
        type: type || req.deviceCredential?.deviceType || 'GATEWAY',
        schoolId: school!.id,
        status: status || 'ONLINE',
        lastSeen: new Date(),
      },
    });

    // Update credential lastSeen and metadata if present
    if (req.deviceCredential) {
      await prisma.deviceCredential.update({
        where: { id: req.deviceCredential.id },
        data: {
          lastSeen: new Date(),
          firmwareVersion: firmwareVersion || req.deviceCredential.firmwareVersion,
          metadata: battery !== undefined ? JSON.stringify({ battery }) : req.deviceCredential.metadata,
        },
      });
    }

    res.json({
      success: true,
      data: {
        deviceId: device.deviceId,
        status: device.status,
        battery: battery || 95,
        firmwareVersion: firmwareVersion || '1.0.4',
        lastSeen: device.lastSeen,
      },
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/devices/:id/deactivate - Deactivate device
router.put('/:id/deactivate', authenticateJWT, authorizeRoles('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const device = await prisma.device.update({
      where: { id },
      data: { status: 'OFFLINE' },
    });

    res.json({ success: true, data: device });
  } catch (err) {
    next(err);
  }
});

export default router;

