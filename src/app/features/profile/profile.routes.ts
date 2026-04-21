import { Routes } from '@angular/router';

export const PROFILE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/profile.page').then((m) => m.ProfilePage),
  },
  {
    path: 'orders',
    loadComponent: () =>
      import('../orders/pages/my-orders.page').then((m) => m.MyOrdersPage),
  },
];
