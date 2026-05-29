import { Request, Response, NextFunction } from 'express';
import pool from '../db.js';
import { verifyToken } from './auth.js';

export async function maintenanceMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const [rows] = await pool.execute("SELECT value FROM config WHERE `key` = 'maintenance_settings'");
    const row = (rows as any[])[0];
    if (!row) {
      next();
      return;
    }
    const maintenance = JSON.parse(row.value);
    if (!maintenance.enabled) {
      next();
      return;
    }

    const path = req.path;
    if (path.startsWith('/api/auth/') || path === '/api/maintenance-status') {
      next();
      return;
    }

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