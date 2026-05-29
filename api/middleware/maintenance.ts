import { Request, Response, NextFunction } from 'express';
import { configDB } from '../dboperations.js';
import { verifyToken } from './auth.js';

export async function maintenanceMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const maintenance = await configDB.get('maintenance_settings');
    if (!maintenance || !maintenance.enabled) {
      next();
      return;
    }

    // Allow auth routes (login, register, etc.) to work
    const path = req.path;
    if (path.startsWith('/api/auth/')) {
      next();
      return;
    }

    // Check if user is admin
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const payload = verifyToken(token);
      if (payload && payload.role === 'admin') {
        next();
        return;
      }
    }

    res.status(503).json({
      success: false,
      error: maintenance.message || '网站维护中，敬请期待...'
    });
  } catch {
    next();
  }
}