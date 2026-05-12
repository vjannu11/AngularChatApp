import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db';
import { signToken } from '../jwt';
import { StoredUser, PublicUser } from '../types';

export const authRouter = Router();

function toPublic(u: StoredUser): PublicUser {
  const { passwordHash: _, ...pub } = u;
  return pub;
}

// ── POST /api/auth/register ───────────────────────────────────────────────────
authRouter.post('/register', async (req: Request, res: Response) => {
  const { username, password, displayName } = req.body as {
    username?: string;
    password?: string;
    displayName?: string;
  };

  if (!username || !password || !displayName) {
    res.status(400).json({ message: 'username, password and displayName are required' });
    return;
  }

  if (username.length < 3) {
    res.status(400).json({ message: 'Username must be at least 3 characters' });
    return;
  }

  if (password.length < 8) {
    res.status(400).json({ message: 'Password must be at least 8 characters' });
    return;
  }

  if (db.findUserByUsername(username)) {
    res.status(409).json({ message: 'Username already taken' });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user: StoredUser = {
    id: uuidv4(),
    username,
    displayName,
    passwordHash,
    status: 'online',
    createdAt: new Date().toISOString(),
  };

  db.users.set(user.id, user);

  const token = signToken({ sub: user.id, username: user.username });
  res.status(201).json({ token, user: toPublic(user) });
});

// ── POST /api/auth/login ──────────────────────────────────────────────────────
authRouter.post('/login', async (req: Request, res: Response) => {
  const { username, password } = req.body as {
    username?: string;
    password?: string;
  };

  if (!username || !password) {
    res.status(400).json({ message: 'username and password are required' });
    return;
  }

  const user = db.findUserByUsername(username);
  if (!user) {
    res.status(401).json({ message: 'Invalid username or password' });
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ message: 'Invalid username or password' });
    return;
  }

  user.status = 'online';
  const token = signToken({ sub: user.id, username: user.username });
  res.json({ token, user: toPublic(user) });
});
