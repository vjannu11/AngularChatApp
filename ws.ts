import { Request, Response, NextFunction } from 'express';
import { verifyToken } from './jwt';
import { db } from './db';

export interface AuthRequest extends Request {
  userId?: string;
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  const header = req.headers['authorization'];
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Missing or invalid token' });
    return;
  }

  try {
    const token = header.slice(7);
    const payload = verifyToken(token);
    const user = db.users.get(payload.sub);
    if (!user) {
      res.status(401).json({ message: 'User not found' });
      return;
    }
    req.userId = payload.sub;
    next();
  } catch {
    res.status(401).json({ message: 'Token expired or invalid' });
  }
}
