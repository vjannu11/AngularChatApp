# NgChat — Real-Time Angular Chat Platform

A production-grade real-time chat application built with Angular 17, showcasing modern Angular patterns and best practices.

---

## ✨ Feature Highlights

- **Real-time messaging** via WebSockets (RxJS `webSocket`)
- **JWT-based authentication** with auto-attach interceptor
- **Reactive state management** using Angular Signals
- **Standalone components** throughout (no NgModules)
- **Lazy-loaded feature routes** (`loadComponent` / `loadChildren`)
- **Route guards** (`authGuard`, `guestGuard`)
- **Reactive forms** with full validation
- **Auto-reconnecting WebSocket** with exponential backoff

---

## 🏗️ Architecture

```
src/app/
├── core/                     # Singleton services, guards, interceptors, models
│   ├── guards/
│   │   └── auth.guard.ts          # authGuard, guestGuard (functional guards)
│   ├── interceptors/
│   │   └── jwt.interceptor.ts     # Attaches Bearer token to every HTTP request
│   ├── models/
│   │   └── index.ts               # All TypeScript interfaces (User, Message, Channel…)
│   └── services/
│       ├── auth.service.ts        # JWT login/register/logout + Signal-based state
│       ├── channel.service.ts     # Channel CRUD + active channel Signal
│       ├── message.service.ts     # Message history + real-time WS listeners
│       └── websocket.service.ts   # RxJS WebSocketSubject wrapper, reconnect logic
│
├── features/
│   ├── auth/
│   │   ├── auth.routes.ts
│   │   ├── login/login.component.ts
│   │   └── register/register.component.ts
│   └── chat/
│       ├── chat.routes.ts
│       ├── chat-shell/chat-shell.component.ts   # Layout shell
│       └── components/
│           ├── channel-sidebar/                 # Channel list + user info
│           ├── message-list/                    # Scrolling message feed
│           └── message-input/                   # Textarea + send button
│
├── shared/
│   └── pipes/
│       └── time-ago.pipe.ts                     # Relative timestamp pipe
│
├── app.component.ts      # Root component (just <router-outlet>)
├── app.config.ts         # Standalone bootstrap config (no AppModule)
└── app.routes.ts         # Top-level lazy routes
```

---

## 🛠️ Modern Angular Patterns Used

| Pattern | Where |
|---|---|
| Standalone components | Every component — no NgModules |
| Angular Signals | `AuthService`, `ChannelService`, `MessageService` |
| Functional route guards | `auth.guard.ts` |
| Functional HTTP interceptors | `jwt.interceptor.ts` |
| `@for` / `@if` control flow | All templates (new syntax, not `*ngFor` / `*ngIf`) |
| `inject()` function | All dependency injection |
| `NonNullableFormBuilder` | Login & Register forms |
| `loadComponent` lazy loading | Every route |
| RxJS `webSocket` | `WebSocketService` |
| Exponential backoff retry | `WebSocketService` |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Angular CLI 17+: `npm install -g @angular/cli`

### Install & Run

```bash
npm install
ng serve
```

Open [http://localhost:4200](http://localhost:4200).

### Environment Configuration

Edit `src/environments/environment.ts`:

```ts
export const environment = {
  apiUrl: 'http://localhost:3000/api',
  wsUrl:  'ws://localhost:3000',
  jwtKey: 'ng_chat_token',
};
```

---

## 🔌 Backend Contract

The app expects a REST + WebSocket backend:

### REST Endpoints
| Method | Path | Body |
|---|---|---|
| POST | `/api/auth/login` | `{ username, password }` |
| POST | `/api/auth/register` | `{ username, password, displayName }` |
| GET | `/api/channels` | — |
| GET | `/api/channels/:id/messages` | — |

### WebSocket Events (sent)
| type | payload |
|---|---|
| `message:new` | `{ channelId, content }` |

### WebSocket Events (received)
| type | payload |
|---|---|
| `message:new` | `Message` object |
| `message:edit` | `Message` object |
| `message:delete` | `{ id: string }` |

---

## 📐 Key Design Decisions

- **Signals over BehaviorSubject** — simpler reactive state without subscription management
- **No NgRx** — appropriate for this scale; Signals + services are sufficient
- **Functional interceptors/guards** — Angular 15+ best practice over class-based
- **Lazy loading everywhere** — routes and components loaded only when needed
- **`@for`/`@if` syntax** — Angular 17 control flow, avoids importing `NgIf`/`NgFor`
