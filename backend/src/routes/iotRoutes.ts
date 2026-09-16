import { Router } from 'express';
import { authenticateJWT, authorizeRoles, AuthenticatedRequest } from '../middleware/auth.js';
import { authenticateDevice, DeviceAuthenticatedRequest } from '../middleware/deviceAuth.js';
import { prisma } from '../config/prisma.js';
import { emitSensorTelemetryEvent, emitAlertEvent } from '../sockets/socketManager.js';

const router = Router();

// GET /api/iot/sensors - List sensors
router.get('/sensors', authenticateJWT, async (req: AuthenticatedRequest, res, next) => {
  try {
    const schoolId = req.user?.schoolId;
    const whereClause = schoolId ? { schoolId } : {};

    const sensors = await prisma.sensor.findMany({
      where: whereClause,
      include: {
        readings: {
          take: 5,
          orderBy: { timestamp: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: sensors });
  } catch (err) {
    next(err);
  }
});

// GET /api/iot/sensors/:id - Sensor details + history
router.get('/sensors/:id', authenticateJWT, async (req: AuthenticatedRequest, res, next) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const sensor = await prisma.sensor.findFirst({
      where: { OR: [{ id }, { sensorId: id }] },
      include: {
        readings: {
          take: 50,
          orderBy: { timestamp: 'desc' },
        },
      },
    });

    if (!sensor) {
      return res.status(404).json({ success: false, error: 'Sensor not found' });
    }

    res.json({ success: true, data: sensor });
  } catch (err) {
    next(err);
  }
});

// POST /api/iot/sensors - Register sensor
router.post('/sensors', authenticateJWT, authorizeRoles('SUPER_ADMIN', 'ADMIN'), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { sensorId, name, sensorType, location, building, room } = req.body;
    const schoolId = req.user?.schoolId;

    if (!schoolId) {
      return res.status(400).json({ success: false, error: 'User is not assigned to a school' });
    }

    const sensor = await prisma.sensor.create({
      data: {
        sensorId,
        name,
        sensorType,
        location,
        building: building || 'Main Block',
        room: room || 'R-101',
        status: 'ONLINE',
        lastHeartbeat: new Date(),
        schoolId,
      },
    });

    res.status(201).json({ success: true, data: sensor });
  } catch (err) {
    next(err);
  }
});

// POST /api/iot/telemetry - Ingest sensor telemetry
router.post('/telemetry', authenticateDevice, async (req: DeviceAuthenticatedRequest, res, next) => {
  try {
    const { deviceId, sensorType, value, unit, rawPayload } = req.body;

    if (!deviceId || value === undefined) {
      return res.status(400).json({ success: false, error: 'deviceId and value are required' });
    }

    const sensor = await prisma.sensor.findFirst({
      where: { sensorId: deviceId },
    });

    if (!sensor) {
      return res.status(404).json({ success: false, error: 'Registered sensor not found' });
    }

    // Format reading display string
    let readingStr = `${value}${unit || ''}`;
    let isWarning = false;
    let alertMessage = '';

    // Evaluate Rule Engine Thresholds
    const typeUpper = (sensorType || sensor.sensorType).toUpperCase();
    const numValue = Number(value);

    if (typeUpper === 'TEMPERATURE' && numValue > 38.0) {
      isWarning = true;
      alertMessage = `High Temperature Alert: Sensor ${sensor.sensorId} (${sensor.name}) recorded ${numValue}°C (Threshold: 38°C)`;
    } else if (typeUpper === 'SMOKE' && (numValue > 0 || String(value).toUpperCase() === 'DETECTED' || String(value).toUpperCase() === 'ALERT')) {
      isWarning = true;
      alertMessage = `CRITICAL Smoke Alert: Smoke detected at ${sensor.name} in ${sensor.building} ${sensor.room}`;
    } else if (typeUpper === 'AIR_QUALITY' && numValue > 150) {
      isWarning = true;
      alertMessage = `Air Quality Alert: AQI ${numValue} (Unhealthy) recorded at ${sensor.name}`;
    } else if (typeUpper === 'WATER_LEVEL' && numValue < 15) {
      isWarning = true;
      alertMessage = `Low Water Level Alert: Water tank at ${sensor.location} is critically low (${numValue}%)`;
    } else if (typeUpper === 'DOOR' && String(value).toUpperCase() === 'UNLOCKED_UNEXPECTED') {
      isWarning = true;
      alertMessage = `Security Alert: Unexpected door access at ${sensor.name} (${sensor.room})`;
    }

    // Update sensor state
    await prisma.sensor.update({
      where: { id: sensor.id },
      data: {
        lastHeartbeat: new Date(),
        latestReading: readingStr,
        status: isWarning ? 'WARNING' : 'ONLINE',
      },
    });

    // Save reading
    const reading = await prisma.sensorReading.create({
      data: {
        sensorId: sensor.id,
        sensorType: typeUpper,
        value: numValue || 0,
        unit: unit || '',
        rawPayload: rawPayload ? JSON.stringify(rawPayload) : null,
      },
    });

    const telemetryData = {
      ...reading,
      sensorId: sensor.sensorId,
      sensorName: sensor.name,
      location: sensor.location,
      building: sensor.building,
      room: sensor.room,
      status: isWarning ? 'WARNING' : 'ONLINE',
    };

    // Emit Socket.IO telemetry
    emitSensorTelemetryEvent(telemetryData);

    // Trigger Alert if threshold breached
    if (isWarning && alertMessage) {
      const alert = await prisma.alert.create({
        data: {
          type: 'SENSOR_THRESHOLD',
          message: alertMessage,
          severity: typeUpper === 'SMOKE' ? 'CRITICAL' : 'HIGH',
        },
      });
      emitAlertEvent(alert);
    }

    res.status(201).json({ success: true, data: telemetryData });
  } catch (err) {
    next(err);
  }
});

// POST /api/iot/simulator/trigger - Trigger simulated reading
router.post('/simulator/trigger', authenticateJWT, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { sensorId, value, unit } = req.body;

    const schoolId = req.user?.schoolId || undefined;
    const sensor = await prisma.sensor.findFirst({
      where: sensorId ? { sensorId } : (schoolId ? { schoolId } : {}),
    });

    if (!sensor) {
      return res.status(404).json({ success: false, error: 'No sensor found' });
    }

    const val = value !== undefined ? Number(value) : (sensor.sensorType === 'TEMPERATURE' ? 42.5 : 95);

    // Call internal telemetry processing
    let isWarning = false;
    let alertMessage = '';
    if (sensor.sensorType === 'TEMPERATURE' && val > 38) {
      isWarning = true;
      alertMessage = `High Temperature Alert: Sensor ${sensor.sensorId} (${sensor.name}) recorded ${val}°C`;
    } else if (sensor.sensorType === 'SMOKE' && val > 0) {
      isWarning = true;
      alertMessage = `CRITICAL Smoke Alert: Smoke detected at ${sensor.name}`;
    }

    await prisma.sensor.update({
      where: { id: sensor.id },
      data: {
        lastHeartbeat: new Date(),
        latestReading: `${val}${unit || '°C'}`,
        status: isWarning ? 'WARNING' : 'ONLINE',
      },
    });

    const reading = await prisma.sensorReading.create({
      data: {
        sensorId: sensor.id,
        sensorType: sensor.sensorType,
        value: val,
        unit: unit || '°C',
      },
    });

    const telemetryData = {
      ...reading,
      sensorId: sensor.sensorId,
      sensorName: sensor.name,
      location: sensor.location,
      building: sensor.building,
      room: sensor.room,
      status: isWarning ? 'WARNING' : 'ONLINE',
    };

    emitSensorTelemetryEvent(telemetryData);

    if (isWarning) {
      const alert = await prisma.alert.create({
        data: {
          type: 'SENSOR_THRESHOLD',
          message: alertMessage,
          severity: 'HIGH',
        },
      });
      emitAlertEvent(alert);
    }

    res.json({ success: true, data: telemetryData });
  } catch (err) {
    next(err);
  }
});

export default router;
