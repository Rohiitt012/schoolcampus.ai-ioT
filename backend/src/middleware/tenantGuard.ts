import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.js';

export const enforceTenantIsolation = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required for tenant isolation.' });
    return;
  }

  // Super Admin can access all tenants or filter by query schoolId
  if (req.user.role === 'SUPER_ADMIN') {
    next();
    return;
  }

  // Enforce tenant scoping for non-Super-Admin roles
  if (!req.user.schoolId) {
    res.status(403).json({ success: false, message: 'User is not assigned to any valid school tenant.' });
    return;
  }

  next();
};
