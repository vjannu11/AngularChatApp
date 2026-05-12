import jwt from 'jsonwebtoken';
import { JwtPayload } from './types';

const SECRET = process.env['JWT_SECRET'] ?? 'ng-chat-dev-secret-change-in-prod';
const EXPIRES_IN = '7d';

export function signToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, SECRET) as JwtPayload;
}
