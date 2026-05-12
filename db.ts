import http from 'http';
import express from 'express';
import cors from 'cors';
import { authRouter } from './routes/auth.routes';
import { channelRouter } from './routes/channel.routes';
import { createWsServer } from './ws';

const PORT = process.env['PORT'] ?? 3000;
const FRONTEND_ORIGIN = process.env['FRONTEND_ORIGIN'] ?? 'http://localhost:4200';

const app = express();

// ── Middleware ─────────────────────────────────────────────────────────────────
app.use(cors({ origin: FRONTEND_ORIGIN, credentials: true }));
app.use(express.json());

// ── Routes ─────────────────────────────────────────────────────────────────────
app.use('/api/auth', authRouter);
app.use('/api/channels', channelRouter);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', ts: new Date().toISOString() });
});

// ── HTTP + WebSocket server ────────────────────────────────────────────────────
const server = http.createServer(app);
createWsServer(server);

server.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════╗
║        NgChat Backend running        ║
║  REST  →  http://localhost:${PORT}/api  ║
║  WS    →  ws://localhost:${PORT}        ║
╚══════════════════════════════════════╝
  `);
});
