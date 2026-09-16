import { Router } from 'express';
import { authenticateJWT, authorizeRoles } from '../middleware/auth.js';
import { prisma } from '../config/prisma.js';
import { emitBusLocationUpdate, emitAlertEvent } from '../sockets/socketManager.js';

const router = Router();

router.get('/', authenticateJWT, async (req, res, next) => {
  try {
    const buses = await prisma.bus.findMany({
      include: {
        driver: { include: { user: { select: { name: true, email: true } } } },
        route: { include: { stops: { orderBy: { sequence: 'asc' } } } },
        locations: { orderBy: { timestamp: 'desc' }, take: 1 },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: buses });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', authenticateJWT, async (req, res, next) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const bus = await prisma.bus.findUnique({
      where: { id },
      include: {
        driver: { include: { user: { select: { name: true, email: true } } } },
        route: { include: { stops: { orderBy: { sequence: 'asc' } } } },
        locations: { orderBy: { timestamp: 'desc' }, take: 20 },
        students: true,
        alerts: { orderBy: { createdAt: 'desc' }, take: 10 },
      },
    });

    if (!bus) {
      res.status(404).json({ success: false, message: 'Bus not found' });
      return;
    }

    res.json({ success: true, data: bus });
  } catch (err) {
    next(err);
  }
});

router.post('/', authenticateJWT, authorizeRoles('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
  try {
    const { busNumber, registrationNumber, driverId, routeId, maxSpeed } = req.body;
    const school = await prisma.school.findFirst();

    const bus = await prisma.bus.create({
      data: {
        busNumber,
        registrationNumber,
        driverId: driverId || null,
        routeId: routeId || null,
        maxSpeed: maxSpeed ? parseFloat(maxSpeed) : 50.0,
        schoolId: school!.id,
      },
    });

    res.status(201).json({ success: true, data: bus });
  } catch (err) {
    next(err);
  }
});

router.put('/:id', authenticateJWT, authorizeRoles('SUPER_ADMIN', 'ADMIN', 'DRIVER'), async (req, res, next) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { busNumber, registrationNumber, driverId, routeId, maxSpeed, status } = req.body;

    const bus = await prisma.bus.update({
      where: { id },
      data: {
        ...(busNumber && { busNumber }),
        ...(registrationNumber && { registrationNumber }),
        ...(driverId !== undefined && { driverId: driverId || null }),
        ...(routeId !== undefined && { routeId: routeId || null }),
        ...(maxSpeed && { maxSpeed: parseFloat(maxSpeed) }),
        ...(status && { status }),
      },
    });

    res.json({ success: true, data: bus });
  } catch (err) {
    next(err);
  }
});

// GPS Ingestion Endpoint (Supports hardware devices & simulator)
router.post('/:id/location', async (req, res, next) => {
  try {
    const { latitude, longitude, speed } = req.body;
    const busId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const bus = await prisma.bus.findUnique({
      where: { id: busId },
      include: { route: { include: { stops: true } } },
    });

    if (!bus) {
      res.status(404).json({ success: false, message: 'Bus not found' });
      return;
    }

    const currentSpeed = parseFloat(speed || '0');
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    // Save location telemetry
    const location = await prisma.busLocation.create({
      data: {
        busId,
        latitude: lat,
        longitude: lng,
        speed: currentSpeed,
        timestamp: new Date(),
      },
    });

    // Update bus status to IN_TRANSIT if active
    if (bus.status === 'INACTIVE' || bus.status === 'ACTIVE') {
      await prisma.bus.update({
        where: { id: busId },
        data: { status: 'IN_TRANSIT' },
      });
    }

    // --- SMART ALERT EVALUATOR ---
    // 1. Overspeed Detection
    if (currentSpeed > bus.maxSpeed) {
      const alert = await prisma.alert.create({
        data: {
          busId,
          type: 'OVERSPEED',
          message: `Bus ${bus.busNumber} detected overspeeding at ${currentSpeed.toFixed(1)} km/h (Limit: ${bus.maxSpeed} km/h).`,
          severity: 'HIGH',
        },
      });

      emitAlertEvent({
        id: alert.id,
        busId,
        busNumber: bus.busNumber,
        type: 'OVERSPEED',
        message: alert.message,
        severity: alert.severity,
        createdAt: alert.createdAt,
      });
    }

    // Broadcast Realtime Socket.IO Update
    emitBusLocationUpdate({
      busId,
      busNumber: bus.busNumber,
      latitude: lat,
      longitude: lng,
      speed: currentSpeed,
      timestamp: location.timestamp,
    });

    res.status(200).json({
      success: true,
      data: location,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
