import { Routes } from '@angular/router';

import { guestGuard } from '../../core/guards/guest.guard';

export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./pages/register.page').then((m) => m.RegisterPage),
  },
  {
    path: 'forgot',
    loadComponent: () =>
      import('./pages/forgot.page').then((m) => m.ForgotPasswordPage),
  },
  { path: '', pathMatch: 'full', redirectTo: 'login' },
];
