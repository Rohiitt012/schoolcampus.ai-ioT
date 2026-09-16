import { PrismaClient } from '@prisma/client';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient();

async function migrate() {
  console.log('🐘 Starting automated SQLite to PostgreSQL Data Migration...');

  const sqliteDbPath = path.join(__dirname, 'dev.db');

  if (!fs.existsSync(sqliteDbPath)) {
    console.error(`❌ SQLite database file not found at ${sqliteDbPath}`);
    process.exit(1);
  }

  const sqlite = new Database(sqliteDbPath, { readonly: true });
  console.log(`📂 Connected to SQLite source: ${sqliteDbPath}`);

  const parseDate = (val: any) => {
    if (!val) return null;
    if (val instanceof Date) return val;
    if (typeof val === 'number') return new Date(val);
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
  };

  try {
    // 1. Schools
    const schools = sqlite.prepare('SELECT * FROM School').all() as any[];
    console.log(`🏫 Migrating ${schools.length} Schools...`);
    for (const s of schools) {
      await prisma.school.upsert({
        where: { id: s.id },
        update: {},
        create: {
          id: s.id,
          name: s.name,
          code: s.code,
          address: s.address,
          createdAt: parseDate(s.createdAt) || new Date(),
          updatedAt: parseDate(s.updatedAt) || new Date(),
        },
      });
    }

    // 2. Users
    const users = sqlite.prepare('SELECT * FROM User').all() as any[];
    console.log(`👤 Migrating ${users.length} Users...`);
    for (const u of users) {
      await prisma.user.upsert({
        where: { id: u.id },
        update: {},
        create: {
          id: u.id,
          email: u.email,
          password: u.password,
          name: u.name,
          role: u.role,
          schoolId: u.schoolId,
          createdAt: parseDate(u.createdAt) || new Date(),
          updatedAt: parseDate(u.updatedAt) || new Date(),
        },
      });
    }

    // 3. Parents
    const parents = sqlite.prepare('SELECT * FROM Parent').all() as any[];
    console.log(`👨‍👩‍👧 Migrating ${parents.length} Parents...`);
    for (const p of parents) {
      await prisma.parent.upsert({
        where: { id: p.id },
        update: {},
        create: {
          id: p.id,
          userId: p.userId,
          phone: p.phone,
          address: p.address,
          schoolId: p.schoolId,
          createdAt: parseDate(p.createdAt) || new Date(),
          updatedAt: parseDate(p.updatedAt) || new Date(),
        },
      });
    }

    // 4. Teachers
    const teachers = sqlite.prepare('SELECT * FROM Teacher').all() as any[];
    console.log(`👩‍🏫 Migrating ${teachers.length} Teachers...`);
    for (const t of teachers) {
      await prisma.teacher.upsert({
        where: { id: t.id },
        update: {},
        create: {
          id: t.id,
          userId: t.userId,
          schoolId: t.schoolId,
          assignedClass: t.assignedClass,
          createdAt: parseDate(t.createdAt) || new Date(),
          updatedAt: parseDate(t.updatedAt) || new Date(),
        },
      });
    }

    // 5. Drivers
    const drivers = sqlite.prepare('SELECT * FROM Driver').all() as any[];
    console.log(`🚍 Migrating ${drivers.length} Drivers...`);
    for (const d of drivers) {
      await prisma.driver.upsert({
        where: { id: d.id },
        update: {},
        create: {
          id: d.id,
          userId: d.userId,
          phone: d.phone,
          licenseNumber: d.licenseNumber,
          schoolId: d.schoolId,
          createdAt: parseDate(d.createdAt) || new Date(),
          updatedAt: parseDate(d.updatedAt) || new Date(),
        },
      });
    }

    // 6. Routes
    const routes = sqlite.prepare('SELECT * FROM Route').all() as any[];
    console.log(`🗺️ Migrating ${routes.length} Routes...`);
    for (const r of routes) {
      await prisma.route.upsert({
        where: { id: r.id },
        update: {},
        create: {
          id: r.id,
          name: r.name,
          schoolId: r.schoolId,
          startPoint: r.startPoint,
          endPoint: r.endPoint,
          createdAt: parseDate(r.createdAt) || new Date(),
          updatedAt: parseDate(r.updatedAt) || new Date(),
        },
      });
    }

    // 7. BusStops
    const busStops = sqlite.prepare('SELECT * FROM BusStop').all() as any[];
    console.log(`🚏 Migrating ${busStops.length} BusStops...`);
    for (const bs of busStops) {
      await prisma.busStop.upsert({
        where: { id: bs.id },
        update: {},
        create: {
          id: bs.id,
          routeId: bs.routeId,
          name: bs.name,
          latitude: Number(bs.latitude),
          longitude: Number(bs.longitude),
          sequence: Number(bs.sequence),
          createdAt: parseDate(bs.createdAt) || new Date(),
          updatedAt: parseDate(bs.updatedAt) || new Date(),
        },
      });
    }

    // 8. Buses
    const buses = sqlite.prepare('SELECT * FROM Bus').all() as any[];
    console.log(`🚌 Migrating ${buses.length} Buses...`);
    for (const b of buses) {
      await prisma.bus.upsert({
        where: { id: b.id },
        update: {},
        create: {
          id: b.id,
          busNumber: b.busNumber,
          registrationNumber: b.registrationNumber,
          driverId: b.driverId || null,
          routeId: b.routeId || null,
          schoolId: b.schoolId,
          status: b.status,
          maxSpeed: Number(b.maxSpeed || 50),
          createdAt: parseDate(b.createdAt) || new Date(),
          updatedAt: parseDate(b.updatedAt) || new Date(),
        },
      });
    }

    // 9. Students
    const students = sqlite.prepare('SELECT * FROM Student').all() as any[];
    console.log(`🎒 Migrating ${students.length} Students...`);
    for (const st of students) {
      await prisma.student.upsert({
        where: { id: st.id },
        update: {},
        create: {
          id: st.id,
          name: st.name,
          rollNumber: st.rollNumber,
          className: st.className,
          section: st.section,
          photo: st.photo || null,
          rfidCardId: st.rfidCardId,
          parentId: st.parentId || null,
          busId: st.busId || null,
          schoolId: st.schoolId,
          status: st.status,
          createdAt: parseDate(st.createdAt) || new Date(),
          updatedAt: parseDate(st.updatedAt) || new Date(),
        },
      });
    }

    // 10. Attendances
    const attendances = sqlite.prepare('SELECT * FROM Attendance').all() as any[];
    console.log(`📋 Migrating ${attendances.length} Attendance records...`);
    for (const a of attendances) {
      await prisma.attendance.upsert({
        where: { id: a.id },
        update: {},
        create: {
          id: a.id,
          studentId: a.studentId,
          date: parseDate(a.date) || new Date(),
          checkIn: parseDate(a.checkIn),
          checkOut: parseDate(a.checkOut),
          deviceId: a.deviceId || null,
          status: a.status,
          createdAt: parseDate(a.createdAt) || new Date(),
          updatedAt: parseDate(a.updatedAt) || new Date(),
        },
      });
    }

    // 11. BusLocations
    const busLocations = sqlite.prepare('SELECT * FROM BusLocation').all() as any[];
    console.log(`📍 Migrating ${busLocations.length} BusLocation GPS telemetry records...`);
    for (const bl of busLocations) {
      await prisma.busLocation.upsert({
        where: { id: bl.id },
        update: {},
        create: {
          id: bl.id,
          busId: bl.busId,
          latitude: Number(bl.latitude),
          longitude: Number(bl.longitude),
          speed: Number(bl.speed),
          timestamp: parseDate(bl.timestamp) || new Date(),
        },
      });
    }

    // 12. Alerts
    const alerts = sqlite.prepare('SELECT * FROM Alert').all() as any[];
    console.log(`⚡ Migrating ${alerts.length} System Alerts...`);
    for (const al of alerts) {
      await prisma.alert.upsert({
        where: { id: al.id },
        update: {},
        create: {
          id: al.id,
          busId: al.busId || null,
          studentId: al.studentId || null,
          type: al.type,
          message: al.message,
          severity: al.severity,
          resolved: Boolean(al.resolved),
          createdAt: parseDate(al.createdAt) || new Date(),
          updatedAt: parseDate(al.updatedAt) || new Date(),
        },
      });
    }

    // 13. Notifications
    const notifications = sqlite.prepare('SELECT * FROM Notification').all() as any[];
    console.log(`🔔 Migrating ${notifications.length} Notifications...`);
    for (const n of notifications) {
      await prisma.notification.upsert({
        where: { id: n.id },
        update: {},
        create: {
          id: n.id,
          userId: n.userId,
          title: n.title,
          message: n.message,
          type: n.type,
          isRead: Boolean(n.isRead),
          createdAt: parseDate(n.createdAt) || new Date(),
        },
      });
    }

    // 14. Devices
    const devices = sqlite.prepare('SELECT * FROM Device').all() as any[];
    console.log(`📟 Migrating ${devices.length} IoT Devices...`);
    for (const d of devices) {
      await prisma.device.upsert({
        where: { id: d.id },
        update: {},
        create: {
          id: d.id,
          deviceId: d.deviceId,
          type: d.type,
          schoolId: d.schoolId,
          status: d.status,
          lastSeen: parseDate(d.lastSeen) || new Date(),
          createdAt: parseDate(d.createdAt) || new Date(),
          updatedAt: parseDate(d.updatedAt) || new Date(),
        },
      });
    }

    // 15. Cameras
    const cameras = sqlite.prepare('SELECT * FROM Camera').all() as any[];
    console.log(`📹 Migrating ${cameras.length} AI CCTV Cameras...`);
    for (const c of cameras) {
      await prisma.camera.upsert({
        where: { id: c.id },
        update: {},
        create: {
          id: c.id,
          name: c.name,
          cameraId: c.cameraId,
          location: c.location,
          building: c.building,
          zone: c.zone,
          cameraType: c.cameraType,
          streamUrl: c.streamUrl || null,
          status: c.status,
          lastHeartbeat: parseDate(c.lastHeartbeat) || new Date(),
          schoolId: c.schoolId,
          createdAt: parseDate(c.createdAt) || new Date(),
          updatedAt: parseDate(c.updatedAt) || new Date(),
        },
      });
    }

    // 16. CameraEvents
    const cameraEvents = sqlite.prepare('SELECT * FROM CameraEvent').all() as any[];
    console.log(`👁️ Migrating ${cameraEvents.length} AI Camera Detection Events...`);
    for (const ce of cameraEvents) {
      await prisma.cameraEvent.upsert({
        where: { id: ce.id },
        update: {},
        create: {
          id: ce.id,
          cameraId: ce.cameraId,
          detectionType: ce.detectionType,
          zone: ce.zone,
          confidence: Number(ce.confidence),
          snapshotUrl: ce.snapshotUrl || null,
          metadata: ce.metadata || null,
          timestamp: parseDate(ce.timestamp) || new Date(),
        },
      });
    }

    // 17. Sensors & SensorReadings
    const sensors = sqlite.prepare('SELECT * FROM Sensor').all() as any[];
    console.log(`🌡️ Migrating ${sensors.length} Environmental Sensors...`);
    for (const sen of sensors) {
      await prisma.sensor.upsert({
        where: { id: sen.id },
        update: {},
        create: {
          id: sen.id,
          sensorId: sen.sensorId,
          name: sen.name,
          sensorType: sen.sensorType,
          location: sen.location,
          building: sen.building,
          room: sen.room,
          status: sen.status,
          latestReading: sen.latestReading || null,
          lastHeartbeat: parseDate(sen.lastHeartbeat) || new Date(),
          schoolId: sen.schoolId,
          createdAt: parseDate(sen.createdAt) || new Date(),
          updatedAt: parseDate(sen.updatedAt) || new Date(),
        },
      });
    }

    const sensorReadings = sqlite.prepare('SELECT * FROM SensorReading').all() as any[];
    console.log(`📈 Migrating ${sensorReadings.length} Sensor Telemetry Readings...`);
    for (const sr of sensorReadings) {
      await prisma.sensorReading.upsert({
        where: { id: sr.id },
        update: {},
        create: {
          id: sr.id,
          sensorId: sr.sensorId,
          sensorType: sr.sensorType,
          value: Number(sr.value),
          unit: sr.unit,
          rawPayload: sr.rawPayload || null,
          timestamp: parseDate(sr.timestamp) || new Date(),
        },
      });
    }

    // 18. EmergencyIncidents & IncidentEvents
    const emergencyIncidents = sqlite.prepare('SELECT * FROM EmergencyIncident').all() as any[];
    console.log(`🚨 Migrating ${emergencyIncidents.length} Emergency Incidents...`);
    for (const ei of emergencyIncidents) {
      await prisma.emergencyIncident.upsert({
        where: { id: ei.id },
        update: {},
        create: {
          id: ei.id,
          incidentType: ei.incidentType,
          severity: ei.severity,
          status: ei.status,
          location: ei.location,
          building: ei.building || null,
          busId: ei.busId || null,
          reporterId: ei.reporterId || null,
          assignedResponder: ei.assignedResponder || null,
          schoolId: ei.schoolId,
          createdAt: parseDate(ei.createdAt) || new Date(),
          updatedAt: parseDate(ei.updatedAt) || new Date(),
        },
      });
    }

    const incidentEvents = sqlite.prepare('SELECT * FROM IncidentEvent').all() as any[];
    console.log(`📜 Migrating ${incidentEvents.length} Incident Timeline Events...`);
    for (const ie of incidentEvents) {
      await prisma.incidentEvent.upsert({
        where: { id: ie.id },
        update: {},
        create: {
          id: ie.id,
          incidentId: ie.incidentId,
          action: ie.action,
          description: ie.description,
          performedBy: ie.performedBy || null,
          timestamp: parseDate(ie.timestamp) || new Date(),
        },
      });
    }

    // 19. DeviceCredentials
    const deviceCredentials = sqlite.prepare('SELECT * FROM DeviceCredential').all() as any[];
    console.log(`🔑 Migrating ${deviceCredentials.length} Device Credentials...`);
    for (const dc of deviceCredentials) {
      await prisma.deviceCredential.upsert({
        where: { id: dc.id },
        update: {},
        create: {
          id: dc.id,
          deviceId: dc.deviceId,
          token: dc.token,
          deviceType: dc.deviceType,
          schoolId: dc.schoolId,
          location: dc.location || null,
          status: dc.status,
          firmwareVersion: dc.firmwareVersion || '1.0.0',
          lastSeen: parseDate(dc.lastSeen) || new Date(),
          metadata: dc.metadata || null,
          createdAt: parseDate(dc.createdAt) || new Date(),
          updatedAt: parseDate(dc.updatedAt) || new Date(),
        },
      });
    }

    console.log('🎉 SQLite to PostgreSQL Data Migration Completed Successfully!');
  } catch (err) {
    console.error('❌ Data migration error:', err);
  } finally {
    sqlite.close();
    await prisma.$disconnect();
  }
}

migrate();
