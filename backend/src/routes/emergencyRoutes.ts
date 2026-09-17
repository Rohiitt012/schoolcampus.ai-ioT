import { Router } from 'express';
import { authenticateJWT, authorizeRoles, AuthenticatedRequest } from '../middleware/auth.js';
import { prisma } from '../config/prisma.js';
import { emitEmergencySOSEvent, emitAlertEvent } from '../sockets/socketManager.js';
import { sendWhatsAppNotification } from '../services/whatsappService.js';

const router = Router();

// GET /api/emergency/incidents - List incidents
router.get('/incidents', authenticateJWT, async (req: AuthenticatedRequest, res, next) => {
  try {
    const schoolId = req.user?.schoolId;
    const whereClause = schoolId ? { schoolId } : {};

    const incidents = await prisma.emergencyIncident.findMany({
      where: whereClause,
      include: {
        bus: true,
        events: {
          orderBy: { timestamp: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: incidents });
  } catch (err) {
    next(err);
  }
});

// GET /api/emergency/incidents/:id - Single incident details + timeline
router.get('/incidents/:id', authenticateJWT, async (req: AuthenticatedRequest, res, next) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const incident = await prisma.emergencyIncident.findUnique({
      where: { id },
      include: {
        bus: true,
        events: {
          orderBy: { timestamp: 'asc' },
        },
      },
    });

    if (!incident) {
      return res.status(404).json({ success: false, error: 'Incident not found' });
    }

    res.json({ success: true, data: incident });
  } catch (err) {
    next(err);
  }
});

// POST /api/emergency/sos - Driver / User SOS Trigger
router.post('/sos', authenticateJWT, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { incidentType, location, building, busId, description } = req.body;
    const schoolId = req.user?.schoolId;
    const user = req.user;

    if (!schoolId) {
      return res.status(400).json({ success: false, error: 'User is not assigned to a school' });
    }

    // Determine default location if driver is assigned to bus
    let resolvedBusId = busId;
    let resolvedLocation = location || 'Campus Main Location';

    if (user?.role === 'DRIVER') {
      const driver = await prisma.driver.findUnique({
        where: { userId: user.userId },
        include: { bus: true },
      });

      if (driver && driver.bus) {
        resolvedBusId = driver.bus.id;
        resolvedLocation = location || `Bus ${driver.bus.busNumber} En-route`;
      }
    }

    // 1. Create Incident
    const incident = await prisma.emergencyIncident.create({
      data: {
        incidentType: incidentType || 'BUS_EMERGENCY',
        severity: 'CRITICAL',
        status: 'OPEN',
        location: resolvedLocation,
        building: building || null,
        busId: resolvedBusId || null,
        reporterId: user?.userId,
        schoolId,
      },
      include: { bus: true },
    });

    // 2. Add initial SOS event to timeline
    await prisma.incidentEvent.create({
      data: {
        incidentId: incident.id,
        action: 'SOS_TRIGGERED',
        description: description || `Emergency SOS triggered by ${user?.name || user?.email || 'User'} (${user?.role})`,
        performedBy: user?.name || user?.email || 'Authorized User',
      },
    });

    // 3. Create High Severity Alert
    const alert = await prisma.alert.create({
      data: {
        busId: resolvedBusId || null,
        type: 'OVERSPEED', // System critical alert marker
        message: `🚨 EMERGENCY SOS: ${incident.incidentType.replace(/_/g, ' ')} at ${resolvedLocation}`,
        severity: 'CRITICAL',
      },
    });

    // 4. Fetch full incident data for broadcast
    const fullIncident = await prisma.emergencyIncident.findUnique({
      where: { id: incident.id },
      include: {
        bus: true,
        events: { orderBy: { timestamp: 'asc' } },
      },
    });

    // 5. Broadcast Socket.IO Events
    emitEmergencySOSEvent(fullIncident);
    emitAlertEvent(alert);

    res.status(201).json({ success: true, data: fullIncident });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/emergency/incidents/:id/status - Update Incident Status
router.patch('/incidents/:id/status', authenticateJWT, authorizeRoles('SUPER_ADMIN', 'ADMIN'), async (req: AuthenticatedRequest, res, next) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { status, responder, notes } = req.body;
    const user = req.user;

    const incident = await prisma.emergencyIncident.findUnique({ where: { id } });

    if (!incident) {
      return res.status(404).json({ success: false, error: 'Incident not found' });
    }

    const updatedIncident = await prisma.emergencyIncident.update({
      where: { id },
      data: {
        status: status || incident.status,
        assignedResponder: responder !== undefined ? responder : incident.assignedResponder,
      },
    });

    // Append to timeline
    await prisma.incidentEvent.create({
      data: {
        incidentId: id,
        action: status || 'STATUS_UPDATED',
        description: notes || `Status changed from ${incident.status} to ${status}${responder ? ` (Assigned: ${responder})` : ''}`,
        performedBy: user?.name || user?.email || 'Admin',
      },
    });

    const fullUpdated = await prisma.emergencyIncident.findUnique({
      where: { id },
      include: {
        bus: true,
        events: { orderBy: { timestamp: 'asc' } },
      },
    });

    emitEmergencySOSEvent(fullUpdated);

    res.json({ success: true, data: fullUpdated });
  } catch (err) {
    next(err);
  }
});

// POST /api/emergency/incidents/:id/notes - Add note to timeline
router.post('/incidents/:id/notes', authenticateJWT, async (req: AuthenticatedRequest, res, next) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { note } = req.body;
    const user = req.user;

    const event = await prisma.incidentEvent.create({
      data: {
        incidentId: id,
        action: 'NOTE_ADDED',
        description: note || 'Update added to incident log.',
        performedBy: user?.name || user?.email || 'Staff User',
      },
    });

    res.status(201).json({ success: true, data: event });
  } catch (err) {
    next(err);
  }
});

export default router;
