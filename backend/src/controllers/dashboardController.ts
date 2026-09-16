import { Response, NextFunction } from 'express';
import { getDashboardStats } from '../services/dashboardService.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export const getStats = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const schoolId = req.user?.schoolId || undefined;
    const stats = await getDashboardStats(schoolId);
    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};
