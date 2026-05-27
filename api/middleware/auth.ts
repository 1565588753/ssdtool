import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'ssd-tool-jwt-secret-key';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '15d' });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

// Express middleware to extract user from token
export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: '未登录' });
    return;
  }

  const token = authHeader.split(' ')[1];
  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({ success: false, error: '登录已过期，请重新登录' });
    return;
  }

  // Set user info on request for downstream routes
  (req as any).user = payload;
  (req as any).userId = payload.userId;
  next();
}

// Optional middleware: extracts user if token exists, but doesn't reject if not
export function optionalAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);
    if (payload) {
      (req as any).user = payload;
      (req as any).userId = payload.userId;
    }
  }
  next();
}

// Helper: extract userId from Bearer token or x-user-id header
export function extractUserId(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);
    if (payload) {
      return payload.userId;
    }
  }
  const legacyUserId = req.headers['x-user-id'] as string;
  if (legacyUserId) {
    return legacyUserId;
  }
  return null;
}