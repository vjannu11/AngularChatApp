import { StoredUser, Channel, Message } from './types';

/**
 * Simple in-memory store — data resets on server restart.
 * Replace with a real DB (PostgreSQL, MongoDB, etc.) for production.
 */
class Database {
  users: Map<string, StoredUser> = new Map();
  channels: Map<string, Channel> = new Map();
  // channelId → Message[]
  messages: Map<string, Message[]> = new Map();

  constructor() {
    this.seed();
  }

  private seed(): void {
    // Seed channels
    const defaultChannels: Channel[] = [
      {
        id: 'ch-general',
        name: 'general',
        description: 'General discussion for everyone',
        isPrivate: false,
        memberCount: 1,
        lastActivity: new Date().toISOString(),
      },
      {
        id: 'ch-random',
        name: 'random',
        description: 'Off-topic conversations',
        isPrivate: false,
        memberCount: 1,
        lastActivity: new Date().toISOString(),
      },
      {
        id: 'ch-angular',
        name: 'angular',
        description: 'Angular tips, patterns, and questions',
        isPrivate: false,
        memberCount: 1,
        lastActivity: new Date().toISOString(),
      },
    ];

    for (const ch of defaultChannels) {
      this.channels.set(ch.id, ch);
      this.messages.set(ch.id, []);
    }

    // Seed a welcome system message in #general
    this.messages.get('ch-general')!.push({
      id: 'msg-welcome',
      channelId: 'ch-general',
      author: {
        id: 'system',
        username: 'system',
        displayName: 'NgChat',
        status: 'online',
        createdAt: new Date().toISOString(),
      },
      content: '👋 Welcome to NgChat! Register or log in to start messaging.',
      createdAt: new Date().toISOString(),
      type: 'system',
    });
  }

  // ── Helpers ────────────────────────────────────────────────────────────────
  findUserByUsername(username: string): StoredUser | undefined {
    return [...this.users.values()].find((u) => u.username === username);
  }

  getChannelMessages(channelId: string): Message[] {
    return this.messages.get(channelId) ?? [];
  }

  addMessage(msg: Message): void {
    const msgs = this.messages.get(msg.channelId) ?? [];
    msgs.push(msg);
    this.messages.set(msg.channelId, msgs);

    // Update channel lastActivity
    const ch = this.channels.get(msg.channelId);
    if (ch) ch.lastActivity = msg.createdAt;
  }
}

export const db = new Database();
