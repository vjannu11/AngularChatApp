import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'chat',
    pathMatch: 'full',
  },
  {
    path: 'auth',
    canActivate: [guestGuard],
    loadChildren: () =>
      import('./features/auth/auth.routes').then((m) => m.authRoutes),
  },
  {
    path: 'chat',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/chat/chat.routes').then((m) => m.chatRoutes),
  },
  {
    path: '**',
    redirectTo: 'chat',
  },
];
