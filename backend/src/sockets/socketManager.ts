import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';

let io: SocketIOServer | null = null;

export const initSocketIO = (server: HTTPServer): SocketIOServer => {
  io = new SocketIOServer(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true,
    },
  });

  io.on('connection', (socket: Socket) => {
    console.log(`🔌 Client connected to Socket.IO: ${socket.id}`);

    socket.on('join:room', (room: string) => {
      socket.join(room);
      console.log(`📡 Socket ${socket.id} joined room: ${room}`);
    });

    socket.on('leave:room', (room: string) => {
      socket.leave(room);
      console.log(`👋 Socket ${socket.id} left room: ${room}`);
    });

    socket.on('disconnect', () => {
      console.log(`❌ Client disconnected from Socket.IO: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = (): SocketIOServer => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
};

export const emitBusLocationUpdate = (data: any) => {
  if (io) {
    io.emit('bus:location-update', data);
    if (data.busId) {
      io.to(`bus:${data.busId}`).emit('bus:location-update', data);
    }
  }
};

export const emitAlertEvent = (data: any) => {
  if (io) {
    io.emit('alert:new', data);
    if (data.busId) {
      io.to(`bus:${data.busId}`).emit('alert:new', data);
    }
    if (data.studentId) {
      io.to(`student:${data.studentId}`).emit('alert:new', data);
    }
  }
};

export const emitAttendanceScanEvent = (data: any) => {
  if (io) {
    io.emit('attendance:scan', data);
    if (data.studentId) {
      io.to(`student:${data.studentId}`).emit('attendance:scan', data);
    }
  }
};

export const emitCameraEvent = (data: any) => {
  if (io) {
    io.emit('camera:event', data);
  }
};

export const emitSensorTelemetryEvent = (data: any) => {
  if (io) {
    io.emit('sensor:telemetry', data);
  }
};

export const emitEmergencySOSEvent = (data: any) => {
  if (io) {
    io.emit('emergency:sos', data);
  }
};

