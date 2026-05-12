import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import { v4 as uuidv4 } from 'uuid';
import { verifyToken } from './jwt';
import { db } from './db';
import { WsClient, WsEvent, Message, PublicUser } from './types';

const clients = new Map<string, WsClient>(); // userId → WsClient

function toPublicUser(userId: string): PublicUser | null {
  const u = db.users.get(userId);
  if (!u) return null;
  const { passwordHash: _, ...pub } = u;
  return pub;
}

function broadcast(event: WsEvent, excludeUserId?: string): void {
  const data = JSON.stringify(event);
  for (const [userId, client] of clients) {
    if (userId === excludeUserId) continue;
    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(data);
    }
  }
}

function sendToUser(userId: string, event: WsEvent): void {
  const client = clients.get(userId);
  if (client?.ws.readyState === WebSocket.OPEN) {
    client.ws.send(JSON.stringify(event));
  }
}

export function createWsServer(server: import('http').Server): WebSocketServer {
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
    // ── Auth via query param (?token=...) ─────────────────────────────────────
    const url = new URL(req.url ?? '', `http://localhost`);
    const token = url.searchParams.get('token');

    if (!token) {
      ws.close(4001, 'Missing token');
      return;
    }

    let userId: string;
    try {
      const payload = verifyToken(token);
      userId = payload.sub;
    } catch {
      ws.close(4001, 'Invalid token');
      return;
    }

    if (!db.users.get(userId)) {
      ws.close(4001, 'User not found');
      return;
    }

    // Register client
    clients.set(userId, { userId, ws });
    console.log(`[WS] User ${userId} connected (${clients.size} total)`);

    // Mark user online & broadcast presence
    const user = db.users.get(userId)!;
    user.status = 'online';
    broadcast({ type: 'user:status', payload: { userId, status: 'online' } });

    // ── Incoming messages ─────────────────────────────────────────────────────
    ws.on('message', (raw) => {
      let event: WsEvent;
      try {
        event = JSON.parse(raw.toString()) as WsEvent;
      } catch {
        return;
      }

      switch (event.type) {
        case 'message:new': {
          const { channelId, content } = event.payload as {
            channelId: string;
            content: string;
          };

          if (!channelId || !content?.trim()) break;
          if (!db.channels.has(channelId)) break;

          const author = toPublicUser(userId);
          if (!author) break;

          const msg: Message = {
            id: uuidv4(),
            channelId,
            author,
            content: content.trim(),
            createdAt: new Date().toISOString(),
            type: 'text',
          };

          db.addMessage(msg);

          // Broadcast to ALL clients (including sender so they see the message)
          broadcast({ type: 'message:new', payload: msg });
          break;
        }

        case 'message:edit': {
          const { messageId, content } = event.payload as {
            messageId: string;
            content: string;
          };

          const msgs = db.getChannelMessages(
            [...db.channels.keys()].find((chId) =>
              db.getChannelMessages(chId).some((m) => m.id === messageId)
            ) ?? ''
          );
          const msg = msgs.find((m) => m.id === messageId);
          if (!msg || msg.author.id !== userId) break;

          msg.content = content.trim();
          msg.editedAt = new Date().toISOString();

          broadcast({ type: 'message:edit', payload: msg });
          break;
        }

        case 'message:delete': {
          const { messageId } = event.payload as { messageId: string };
          for (const [chId, msgs] of db.messages) {
            const idx = msgs.findIndex((m) => m.id === messageId);
            if (idx !== -1 && msgs[idx]!.author.id === userId) {
              msgs.splice(idx, 1);
              broadcast({ type: 'message:delete', payload: { id: messageId } });
              break;
            }
          }
          break;
        }

        default:
          console.warn('[WS] Unknown event type:', event.type);
      }
    });

    // ── Disconnect ────────────────────────────────────────────────────────────
    ws.on('close', () => {
      clients.delete(userId);
      const u = db.users.get(userId);
      if (u) u.status = 'offline';
      broadcast({ type: 'user:status', payload: { userId, status: 'offline' } });
      console.log(`[WS] User ${userId} disconnected (${clients.size} total)`);
    });

    ws.on('error', (err) => {
      console.error(`[WS] Error for user ${userId}:`, err.message);
    });
  });

  return wss;
}
