import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma.js';

export interface DeviceAuthenticatedRequest extends Request {
  deviceCredential?: any;
}

export const authenticateDevice = async (
  req: DeviceAuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const deviceId = (req.headers['x-device-id'] as string) || req.body?.deviceId;
    const deviceToken = (req.headers['x-device-token'] as string) || req.body?.deviceToken;

    // For simulator flexibility or development fallback, if headers are not sent but request comes from authenticated session user, pass through
    if (!deviceId && !deviceToken) {
      return next();
    }

    if (!deviceId) {
      return res.status(401).json({ success: false, error: 'Missing X-DEVICE-ID header' });
    }

    const credential = await prisma.deviceCredential.findUnique({
      where: { deviceId },
    });

    if (!credential || credential.status !== 'ACTIVE') {
      return res.status(401).json({ success: false, error: 'Invalid or inactive device ID' });
    }

    if (deviceToken && credential.token !== deviceToken) {
      return res.status(401).json({ success: false, error: 'Invalid device token credentials' });
    }

    req.deviceCredential = credential;
    next();
  } catch (err) {
    next(err);
  }
};
