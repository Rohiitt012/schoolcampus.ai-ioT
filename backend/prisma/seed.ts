import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed for Smart School IoT...');

  // Clear existing data
  await prisma.notification.deleteMany();
  await prisma.alert.deleteMany();
  await prisma.busLocation.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.student.deleteMany();
  await prisma.device.deleteMany();
  await prisma.bus.deleteMany();
  await prisma.driver.deleteMany();
  await prisma.teacher.deleteMany();
  await prisma.parent.deleteMany();
  await prisma.user.deleteMany();
  await prisma.busStop.deleteMany();
  await prisma.route.deleteMany();
  await prisma.school.deleteMany();

  const hashedPassword = await bcrypt.hash('password123', 10);

  // 1. Create School 1 (Smart Academy International)
  const school1 = await prisma.school.create({
    data: {
      name: 'Smart Academy International',
      code: 'SAC-001',
      address: '100 Innovation Parkway, Tech District, Cityville',
    },
  });

  // 2. Create School 2 (Greenwood High School - Multi-Tenant Isolation Test)
  const school2 = await prisma.school.create({
    data: {
      name: 'Greenwood High School',
      code: 'GWH-002',
      address: '500 Forest Boulevard, Greenwood Suburb',
    },
  });

  console.log(`🏫 Created Schools: ${school1.name} & ${school2.name}`);

  // 3. Create Users for School 1
  const superAdminUser = await prisma.user.create({
    data: {
      email: 'superadmin@smartschool.com',
      password: hashedPassword,
      name: 'Global System Admin',
      role: 'SUPER_ADMIN',
      schoolId: school1.id,
    },
  });

  const admin1User = await prisma.user.create({
    data: {
      email: 'admin@smartschool.com',
      password: hashedPassword,
      name: 'Principal Sarah Jenkins',
      role: 'ADMIN',
      schoolId: school1.id,
    },
  });

  const teacher1User = await prisma.user.create({
    data: {
      email: 'teacher@smartschool.com',
      password: hashedPassword,
      name: 'Prof. Anita Roy',
      role: 'TEACHER',
      schoolId: school1.id,
    },
  });

  await prisma.teacher.create({
    data: {
      userId: teacher1User.id,
      schoolId: school1.id,
      assignedClass: '7-A',
    },
  });

  const driver1User = await prisma.user.create({
    data: {
      email: 'driver@smartschool.com',
      password: hashedPassword,
      name: 'Rajesh Kumar',
      role: 'DRIVER',
      schoolId: school1.id,
    },
  });

  const driver1 = await prisma.driver.create({
    data: {
      userId: driver1User.id,
      phone: '+91 9811223344',
      licenseNumber: 'DL-9982341-X',
      schoolId: school1.id,
    },
  });

  const parent1User = await prisma.user.create({
    data: {
      email: 'parent@smartschool.com',
      password: hashedPassword,
      name: 'Vikram Sharma',
      role: 'PARENT',
      schoolId: school1.id,
    },
  });

  const parent1 = await prisma.parent.create({
    data: {
      userId: parent1User.id,
      phone: '+91 9876543210',
      address: '42 Lotus Heights, Sector 15, Cityville',
      schoolId: school1.id,
    },
  });

  // 4. Create Users for School 2 (Greenwood High)
  const admin2User = await prisma.user.create({
    data: {
      email: 'admin@greenwood.com',
      password: hashedPassword,
      name: 'Principal Robert Greenwood',
      role: 'ADMIN',
      schoolId: school2.id,
    },
  });

  const teacher2User = await prisma.user.create({
    data: {
      email: 'teacher@greenwood.com',
      password: hashedPassword,
      name: 'Ms. Clara Oswald',
      role: 'TEACHER',
      schoolId: school2.id,
    },
  });

  await prisma.teacher.create({
    data: {
      userId: teacher2User.id,
      schoolId: school2.id,
      assignedClass: '10-B',
    },
  });

  // 5. Routes & Buses for School 1
  const route1 = await prisma.route.create({
    data: {
      name: 'Route 101 - North Sector Express',
      schoolId: school1.id,
      startPoint: 'North Sector Hub',
      endPoint: 'Smart Academy Campus',
      stops: {
        create: [
          { name: 'North Sector Hub', latitude: 28.6700, longitude: 77.4500, sequence: 1 },
          { name: 'Green Park Market', latitude: 28.6750, longitude: 77.4560, sequence: 2 },
          { name: 'Oakwood Apartments', latitude: 28.6810, longitude: 77.4620, sequence: 3 },
          { name: 'Smart Academy Campus', latitude: 28.6880, longitude: 77.4700, sequence: 4 },
        ],
      },
    },
  });

  const bus1 = await prisma.bus.create({
    data: {
      busNumber: 'BUS-101',
      registrationNumber: 'DL-01-AB-1001',
      driverId: driver1.id,
      routeId: route1.id,
      schoolId: school1.id,
      status: 'IN_TRANSIT',
      maxSpeed: 50.0,
    },
  });

  // 6. Students for School 1
  const student1 = await prisma.student.create({
    data: {
      name: 'Rahul Sharma',
      rollNumber: '701',
      className: '7-A',
      section: 'A',
      rfidCardId: 'RFID-10001',
      parentId: parent1.id,
      busId: bus1.id,
      schoolId: school1.id,
      status: 'ACTIVE',
    },
  });

  // 7. Student for School 2
  await prisma.student.create({
    data: {
      name: 'Ethan Greenwood',
      rollNumber: '1001',
      className: '10-B',
      section: 'B',
      rfidCardId: 'RFID-20001',
      schoolId: school2.id,
      status: 'ACTIVE',
    },
  });

  // Today's attendance log for Rahul Sharma
  await prisma.attendance.create({
    data: {
      studentId: student1.id,
      date: new Date(),
      checkIn: new Date(),
      deviceId: 'GATE-01',
      status: 'PRESENT',
    },
  });

  // Sample Devices
  await prisma.device.createMany({
    data: [
      { deviceId: 'GATE-01', type: 'RFID_READER', schoolId: school1.id, status: 'ONLINE' },
      { deviceId: 'BUS-GPS-101', type: 'GPS_TRACKER', schoolId: school1.id, status: 'ONLINE' },
      { deviceId: 'GWH-GATE-01', type: 'RFID_READER', schoolId: school2.id, status: 'ONLINE' },
    ],
  });

  // Cameras
  const cam1 = await prisma.camera.create({
    data: {
      name: 'Main Gate AI Camera',
      cameraId: 'GATE-CAM-01',
      location: 'Main School Gate',
      building: 'Admin Block',
      zone: 'Main Entrance',
      cameraType: 'CCTV',
      streamUrl: 'rtsp://admin:pass@192.168.1.100:554/stream1',
      status: 'ONLINE',
      schoolId: school1.id,
    },
  });

  await prisma.camera.create({
    data: {
      name: 'East Playground Cam',
      cameraId: 'PLAY-CAM-02',
      location: 'East Field',
      building: 'Sports Complex',
      zone: 'Playground',
      cameraType: 'IP_CAMERA',
      streamUrl: 'rtsp://admin:pass@192.168.1.101:554/stream1',
      status: 'ONLINE',
      schoolId: school1.id,
    },
  });

  await prisma.cameraEvent.create({
    data: {
      cameraId: cam1.id,
      detectionType: 'PERSON_DETECTED',
      zone: 'Main Entrance',
      confidence: 94.5,
      timestamp: new Date(),
      metadata: JSON.stringify({ boundingBox: [120, 45, 200, 350], label: 'Student Entry' }),
    },
  });

  // Sensors
  const tempSensor = await prisma.sensor.create({
    data: {
      sensorId: 'TEMP-101',
      name: 'Server Room Temp & Humidity Sensor',
      sensorType: 'TEMPERATURE',
      location: 'Server Room',
      building: 'Tech Center',
      room: 'B-102',
      status: 'ONLINE',
      latestReading: '24.5°C',
      schoolId: school1.id,
    },
  });

  await prisma.sensorReading.create({
    data: {
      sensorId: tempSensor.id,
      sensorType: 'TEMPERATURE',
      value: 24.5,
      unit: 'C',
      rawPayload: JSON.stringify({ deviceId: 'TEMP-101', battery: 98 }),
    },
  });

  await prisma.sensor.create({
    data: {
      sensorId: 'SMOKE-201',
      name: 'Chemistry Lab Smoke Detector',
      sensorType: 'SMOKE',
      location: 'Science Block',
      building: 'Science Building',
      room: 'Lab-3',
      status: 'ONLINE',
      latestReading: 'NORMAL',
      schoolId: school1.id,
    },
  });

  await prisma.sensor.create({
    data: {
      sensorId: 'AIR-301',
      name: 'Auditorium Air Quality Monitor',
      sensorType: 'AIR_QUALITY',
      location: 'Auditorium',
      building: 'Main Hall',
      room: 'Auditorium Main',
      status: 'ONLINE',
      latestReading: 'GOOD (AQI: 42)',
      schoolId: school1.id,
    },
  });

  // Emergency Incidents
  const emergency1 = await prisma.emergencyIncident.create({
    data: {
      incidentType: 'BUS_EMERGENCY',
      severity: 'CRITICAL',
      status: 'OPEN',
      location: 'North Sector Hub - Route 101',
      busId: bus1.id,
      reporterId: driver1User.id,
      schoolId: school1.id,
    },
  });

  await prisma.incidentEvent.create({
    data: {
      incidentId: emergency1.id,
      action: 'SOS_TRIGGERED',
      description: 'Driver activated SOS button on BUS-101 near North Sector Hub.',
      performedBy: 'Rajesh Kumar (Driver)',
    },
  });

  // Device Credentials (Hardware Integration)
  await prisma.deviceCredential.createMany({
    data: [
      {
        deviceId: 'GPS-BUS-101',
        token: 'devtok_gps_101_secret_key_8923',
        deviceType: 'GPS_TRACKER',
        schoolId: school1.id,
        location: 'Bus 101 Dashboard ESP32',
        status: 'ACTIVE',
        firmwareVersion: '1.0.4',
      },
      {
        deviceId: 'TEMP-101',
        token: 'devtok_temp_101_secret_key_4432',
        deviceType: 'IOT_SENSOR',
        schoolId: school1.id,
        location: 'Server Room NodeMCU',
        status: 'ACTIVE',
        firmwareVersion: '2.1.0',
      },
      {
        deviceId: 'GATE-CAM-01',
        token: 'devtok_cam_01_secret_key_9911',
        deviceType: 'CCTV_CAMERA',
        schoolId: school1.id,
        location: 'Gate 1 AI Gateway',
        status: 'ACTIVE',
        firmwareVersion: '3.0.1',
      },
    ],
  });

  console.log('🎉 Multi-tenant database seed completed with Phase 11-15 enterprise data!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
