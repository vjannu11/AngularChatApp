# NgChat — Real-Time Angular Chat Platform

A full-stack real-time chat application built with Angular 17 (frontend) and Node.js + Express + WebSockets (backend). Features JWT authentication, live messaging, and modern Angular 17 patterns throughout.

---

## 📋 Table of Contents

- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [Frontend](#-frontend)
- [Backend](#-backend)
- [Running Both Together](#-running-both-together)
- [API Reference](#-api-reference)
- [WebSocket Events](#-websocket-events)

---

## ⚡ Quick Start

> You'll need two terminals open — one for the backend, one for the frontend.

### Terminal 1 — Backend
```bash
cd ng-chat-backend
npm install
npm run dev
```
Backend starts at `http://localhost:3000`.

### Terminal 2 — Frontend
```bash
cd ng-chat
npm install
ng serve
```
Frontend starts at `http://localhost:4200`.

Open your browser to **http://localhost:4200**, register an account, and start chatting. Open a second tab to chat between two users in real time.

---

## 📁 Project Structure

```
/
├── ng-chat/               # Angular 17 frontend
│   └── src/app/
│       ├── core/          # Guards, interceptors, models, services
│       ├── features/      # Auth (login/register) + Chat (shell, sidebar, messages)
│       ├── shared/        # Reusable pipes
│       ├── app.config.ts  # Standalone bootstrap (no AppModule)
│       └── app.routes.ts  # Top-level lazy routes
│
└── ng-chat-backend/       # Node.js + Express + WebSocket backend
    └── src/
        ├── routes/        # auth.routes.ts, channel.routes.ts
        ├── index.ts       # Server entry point
        ├── ws.ts          # WebSocket handler
        ├── db.ts          # In-memory store (seeded on startup)
        ├── jwt.ts         # Sign/verify JWT
        └── middleware.ts  # requireAuth middleware
```

---

## 🖥️ Frontend

### Prerequisites
- Node.js 18+
- Angular CLI 17+

```bash
npm install -g @angular/cli
```

### Install & Run

```bash
cd ng-chat
npm install
ng serve
```

### Environment Configuration

Edit `src/environments/environment.ts` to point at your backend:

```ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  wsUrl:  'ws://localhost:3000',
  jwtKey: 'ng_chat_token',
};
```

### Modern Angular Patterns Used

| Pattern | Where |
|---|---|
| Standalone components | Every component — no NgModules |
| Angular Signals | `AuthService`, `ChannelService`, `MessageService` |
| Functional route guards | `auth.guard.ts` |
| Functional HTTP interceptors | `jwt.interceptor.ts` |
| `@for` / `@if` control flow | All templates (Angular 17 syntax) |
| `inject()` function | All dependency injection |
| `NonNullableFormBuilder` | Login & Register forms |
| `loadComponent` lazy loading | Every route |
| RxJS `webSocket` | `WebSocketService` |
| Exponential backoff retry | `WebSocketService` |

### Features
- JWT-based login and registration with protected routes
- Channel sidebar listing all available channels
- Real-time message feed with live updates
- Auto-scrolling message list
- Auto-reconnecting WebSocket with exponential backoff
- Reactive forms with full validation

---

## 🔧 Backend

### Prerequisites
- Node.js 18+

### Install & Run

```bash
cd ng-chat-backend
npm install
npm run dev     # development (auto-restarts on file change)
npm start       # production (runs compiled JS from /dist)
```

### Environment Variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | HTTP/WS port |
| `JWT_SECRET` | `ng-chat-dev-secret-change-in-prod` | JWT signing secret |
| `FRONTEND_ORIGIN` | `http://localhost:4200` | CORS allowed origin |

For production, create a `.env` file in `ng-chat-backend/`:
```
PORT=3000
JWT_SECRET=your-strong-secret-here
FRONTEND_ORIGIN=https://your-frontend-domain.com
```

### Seed Data

Three channels are created automatically on server startup: `#general`, `#random`, and `#angular`. A welcome message is posted to `#general`. Data is stored in memory and resets when the server restarts — swap out `db.ts` to connect a real database (PostgreSQL, MongoDB, etc.).

---

## 🚀 Running Both Together

```
Browser (localhost:4200)
        │
        │  HTTP (REST)         WebSocket
        ▼                           ▼
Angular Frontend  ──────────►  Express Backend (localhost:3000)
                                    │
                              In-Memory Store
                           (users, channels, messages)
```

1. Start the backend first (`npm run dev` in `ng-chat-backend/`)
2. Start the frontend (`ng serve` in `ng-chat/`)
3. Open `http://localhost:4200`
4. Register a new account
5. Select a channel from the sidebar and send a message
6. Open a second browser tab, register another account, and chat between them in real time

---

## 📡 API Reference

All routes prefixed with `/api`. Protected routes require `Authorization: Bearer <token>` header.

| Method | Path | Auth | Body | Description |
|---|---|---|---|---|
| POST | `/api/auth/register` | ✗ | `{ username, password, displayName }` | Register new user |
| POST | `/api/auth/login` | ✗ | `{ username, password }` | Login, returns JWT |
| GET | `/api/channels` | ✓ | — | List all channels |
| GET | `/api/channels/:id/messages` | ✓ | — | Last 50 messages in channel |
| POST | `/api/channels` | ✓ | `{ name, description?, isPrivate? }` | Create a channel |
| GET | `/health` | ✗ | — | Health check |

---

## 🔌 WebSocket Events

Connect to `ws://localhost:3000?token=<JWT>`.

### Sent by client → server

```json
{ "type": "message:new",    "payload": { "channelId": "ch-general", "content": "Hello!" } }
{ "type": "message:edit",   "payload": { "messageId": "...", "content": "Edited text" } }
{ "type": "message:delete", "payload": { "messageId": "..." } }
```

### Received by client ← server

```json
{ "type": "message:new",    "payload": { /* Full Message object */ } }
{ "type": "message:edit",   "payload": { /* Full Message object */ } }
{ "type": "message:delete", "payload": { "id": "..." } }
{ "type": "user:status",    "payload": { "userId": "...", "status": "online | offline" } }
```

---

## 🏗️ Key Design Decisions

- **Signals over BehaviorSubject** — simpler reactive state without manual subscription management
- **No NgRx** — Signals + services are sufficient at this scale
- **Functional interceptors/guards** — Angular 15+ best practice over class-based alternatives
- **Lazy loading everywhere** — routes and components loaded only when needed
- **`@for`/`@if` syntax** — Angular 17 control flow, avoids importing `NgIf`/`NgFor`
- **In-memory store** — no database setup required to run and demo the app
