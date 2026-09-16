import { Router } from 'express';
import { authenticateJWT, authorizeRoles, AuthenticatedRequest } from '../middleware/auth.js';
import { prisma } from '../config/prisma.js';
import { emitCameraEvent, emitAlertEvent } from '../sockets/socketManager.js';

const router = Router();

// GET /api/cameras - List all cameras for school
router.get('/', authenticateJWT, async (req: AuthenticatedRequest, res, next) => {
  try {
    const schoolId = req.user?.schoolId;
    const whereClause = schoolId ? { schoolId } : {};

    const cameras = await prisma.camera.findMany({
      where: whereClause,
      include: {
        events: {
          take: 5,
          orderBy: { timestamp: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: cameras });
  } catch (err) {
    next(err);
  }
});

// GET /api/cameras/:id - Get single camera details
router.get('/:id', authenticateJWT, async (req: AuthenticatedRequest, res, next) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const camera = await prisma.camera.findUnique({
      where: { id },
      include: {
        events: {
          take: 20,
          orderBy: { timestamp: 'desc' },
        },
      },
    });

    if (!camera) {
      return res.status(404).json({ success: false, error: 'Camera not found' });
    }

    res.json({ success: true, data: camera });
  } catch (err) {
    next(err);
  }
});

// POST /api/cameras - Register camera
router.post('/', authenticateJWT, authorizeRoles('SUPER_ADMIN', 'ADMIN'), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { name, cameraId, location, building, zone, cameraType, streamUrl } = req.body;
    const schoolId = req.user?.schoolId;

    if (!schoolId) {
      return res.status(400).json({ success: false, error: 'User is not assigned to a school' });
    }

    const camera = await prisma.camera.create({
      data: {
        name,
        cameraId,
        location,
        building: building || 'Main Campus',
        zone: zone || 'General',
        cameraType: cameraType || 'CCTV',
        streamUrl,
        status: 'ONLINE',
        lastHeartbeat: new Date(),
        schoolId,
      },
    });

    res.status(201).json({ success: true, data: camera });
  } catch (err) {
    next(err);
  }
});

// POST /api/cameras/:id/events - Detection pipeline ingestion
router.post('/:id/events', async (req, res, next) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { detectionType, zone, confidence, snapshotUrl, metadata } = req.body;

    const camera = await prisma.camera.findFirst({
      where: { OR: [{ id }, { cameraId: id }] },
    });

    if (!camera) {
      return res.status(404).json({ success: false, error: 'Camera not found' });
    }

    // Update heartbeat
    await prisma.camera.update({
      where: { id: camera.id },
      data: { lastHeartbeat: new Date(), status: 'ONLINE' },
    });

    // Store event
    const event = await prisma.cameraEvent.create({
      data: {
        cameraId: camera.id,
        detectionType: detectionType || 'PERSON_DETECTED',
        zone: zone || camera.zone,
        confidence: confidence || 90.0,
        snapshotUrl: snapshotUrl || null,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });

    const eventPayload = {
      ...event,
      cameraName: camera.name,
      cameraId: camera.cameraId,
      location: camera.location,
    };

    // Emit realtime Socket.IO event
    emitCameraEvent(eventPayload);

    // If restricted / unusual / crowd / unauthorized, generate System Alert
    if (['UNAUTHORIZED_AREA_ACTIVITY', 'RESTRICTED_AREA_ENTRY', 'UNUSUAL_ACTIVITY', 'ABANDONED_OBJECT'].includes(detectionType)) {
      const alert = await prisma.alert.create({
        data: {
          type: 'UNUSUAL_ACTIVITY',
          message: `AI Video Detection: ${detectionType.replace(/_/g, ' ')} detected at ${camera.name} (${camera.zone})`,
          severity: detectionType === 'UNAUTHORIZED_AREA_ACTIVITY' ? 'HIGH' : 'MEDIUM',
        },
      });
      emitAlertEvent(alert);
    }

    res.status(201).json({ success: true, data: eventPayload });
  } catch (err) {
    next(err);
  }
});

// POST /api/cameras/simulator/trigger - Video Analytics Simulator
router.post('/simulator/trigger', authenticateJWT, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { cameraId, detectionType, zone, confidence } = req.body;

    const schoolId = req.user?.schoolId || undefined;
    const camera = await prisma.camera.findFirst({
      where: cameraId ? { cameraId } : (schoolId ? { schoolId } : {}),
    });

    if (!camera) {
      return res.status(404).json({ success: false, error: 'No camera found for simulation' });
    }

    const event = await prisma.cameraEvent.create({
      data: {
        cameraId: camera.id,
        detectionType: detectionType || 'PERSON_DETECTED',
        zone: zone || camera.zone,
        confidence: confidence || Math.floor(85 + Math.random() * 14),
        snapshotUrl: `https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?w=500&auto=format&fit=crop`,
        metadata: JSON.stringify({ simulated: true, timestamp: new Date() }),
      },
    });

    const payload = {
      ...event,
      cameraName: camera.name,
      cameraId: camera.cameraId,
      location: camera.location,
    };

    emitCameraEvent(payload);

    res.json({ success: true, data: payload });
  } catch (err) {
    next(err);
  }
});

export default router;
