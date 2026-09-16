import { prisma } from '../config/prisma.js';

export const getDashboardStats = async (schoolId?: string) => {
  const whereSchool = schoolId ? { schoolId } : {};

  const totalStudents = await prisma.student.count({ where: whereSchool });
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const presentToday = await prisma.attendance.count({
    where: {
      date: { gte: today },
      status: 'PRESENT',
      student: whereSchool,
    },
  });

  const absentToday = await prisma.attendance.count({
    where: {
      date: { gte: today },
      status: 'ABSENT',
      student: whereSchool,
    },
  });

  const activeBuses = await prisma.bus.count({
    where: {
      ...whereSchool,
      status: { in: ['ACTIVE', 'IN_TRANSIT'] },
    },
  });

  const activeAlerts = await prisma.alert.count({
    where: {
      resolved: false,
      bus: whereSchool,
    },
  });

  const studentsOnBus = await prisma.student.count({
    where: {
      ...whereSchool,
      busId: { not: null },
    },
  });

  // Attendance trend (last 7 days)
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const attendanceTrends = await Promise.all(
    last7Days.map(async (day) => {
      const nextDay = new Date(day);
      nextDay.setDate(nextDay.getDate() + 1);

      const count = await prisma.attendance.count({
        where: {
          date: { gte: day, lt: nextDay },
          status: 'PRESENT',
          student: whereSchool,
        },
      });

      return {
        date: day.toISOString().split('T')[0],
        dayName: day.toLocaleDateString('en-US', { weekday: 'short' }),
        presentCount: count,
      };
    })
  );

  // Active buses detailed live telemetry
  const busesWithLocation = await prisma.bus.findMany({
    where: whereSchool,
    include: {
      driver: {
        include: {
          user: { select: { name: true } },
        },
      },
      route: true,
      locations: {
        orderBy: { timestamp: 'desc' },
        take: 1,
      },
    },
  });

  const recentAlerts = await prisma.alert.findMany({
    where: { resolved: false },
    include: {
      bus: { select: { busNumber: true } },
      student: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  return {
    metrics: {
      totalStudents,
      presentToday,
      absentToday,
      activeBuses,
      studentsOnBus,
      activeAlerts,
      attendancePercentage: totalStudents > 0 ? Math.round((presentToday / totalStudents) * 100) : 0,
    },
    attendanceTrends,
    busesWithLocation,
    recentAlerts,
  };
};
