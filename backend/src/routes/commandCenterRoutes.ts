import { Router } from 'express';
import { authenticateJWT, AuthenticatedRequest } from '../middleware/auth.js';
import { prisma } from '../config/prisma.js';

const router = Router();

// GET /api/command-center/metrics - Operations control room high level numbers
router.get('/metrics', authenticateJWT, async (req: AuthenticatedRequest, res, next) => {
  try {
    const schoolId = req.user?.schoolId;
    const whereClause = schoolId ? { schoolId } : {};

    const [
      totalStudents,
      activeBuses,
      onlineDevices,
      onlineCameras,
      activeAlerts,
      openEmergencies,
    ] = await Promise.all([
      prisma.student.count({ where: { ...whereClause, status: 'ACTIVE' } }),
      prisma.bus.count({ where: { ...whereClause, status: 'IN_TRANSIT' } }),
      prisma.sensor.count({ where: { ...whereClause, status: 'ONLINE' } }),
      prisma.camera.count({ where: { ...whereClause, status: 'ONLINE' } }),
      prisma.alert.count({ where: { resolved: false } }),
      prisma.emergencyIncident.count({
        where: { ...whereClause, status: { in: ['OPEN', 'ACKNOWLEDGED', 'IN_PROGRESS'] } },
      }),
    ]);

    res.json({
      success: true,
      data: {
        totalStudents,
        activeBuses,
        onlineDevices,
        onlineCameras,
        activeAlerts,
        openEmergencies,
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/command-center/overview - Consolidated map data & live feeds
router.get('/overview', authenticateJWT, async (req: AuthenticatedRequest, res, next) => {
  try {
    const schoolId = req.user?.schoolId;
    const whereClause = schoolId ? { schoolId } : {};

    const [buses, cameras, sensors, incidents, alerts, cameraEvents] = await Promise.all([
      prisma.bus.findMany({
        where: whereClause,
        include: {
          driver: { include: { user: true } },
          locations: { take: 1, orderBy: { timestamp: 'desc' } },
        },
      }),
      prisma.camera.findMany({
        where: whereClause,
        take: 10,
      }),
      prisma.sensor.findMany({
        where: whereClause,
        take: 10,
      }),
      prisma.emergencyIncident.findMany({
        where: { ...whereClause, status: { in: ['OPEN', 'ACKNOWLEDGED', 'IN_PROGRESS'] } },
        include: { bus: true, events: { orderBy: { timestamp: 'desc' }, take: 1 } },
      }),
      prisma.alert.findMany({
        where: { resolved: false },
        take: 10,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.cameraEvent.findMany({
        take: 10,
        orderBy: { timestamp: 'desc' },
        include: { camera: true },
      }),
    ]);

    res.json({
      success: true,
      data: {
        buses,
        cameras,
        sensors,
        incidents,
        alerts,
        cameraEvents,
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
