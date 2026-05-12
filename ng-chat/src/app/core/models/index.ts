// ─── User ───────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  status: 'online' | 'away' | 'offline';
  createdAt: string;
}

// ─── Auth ────────────────────────────────────────────────────────────────────
export interface AuthCredentials {
  username: string;
  password: string;
}

export interface RegisterPayload extends AuthCredentials {
  displayName: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// ─── Channel ─────────────────────────────────────────────────────────────────
export interface Channel {
  id: string;
  name: string;
  description?: string;
  isPrivate: boolean;
  memberCount: number;
  lastActivity?: string;
}

// ─── Message ─────────────────────────────────────────────────────────────────
export interface Message {
  id: string;
  channelId: string;
  author: User;
  content: string;
  createdAt: string;
  editedAt?: string;
  type: 'text' | 'system' | 'file';
}

// ─── WebSocket Events ─────────────────────────────────────────────────────────
export interface WsEvent<T = unknown> {
  type: WsEventType;
  payload: T;
}

export type WsEventType =
  | 'message:new'
  | 'message:edit'
  | 'message:delete'
  | 'user:joined'
  | 'user:left'
  | 'user:status'
  | 'channel:updated'
  | 'error';
