import { Routes } from '@angular/router';

import { AdminShellComponent } from './components/admin-shell.component';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminShellComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./pages/dashboard.page').then((m) => m.AdminDashboardPage),
      },
      {
        path: 'products',
        loadComponent: () =>
          import('./pages/admin-products.page').then((m) => m.AdminProductsPage),
      },
      {
        path: 'orders',
        loadComponent: () =>
          import('./pages/admin-orders.page').then((m) => m.AdminOrdersPage),
      },
      {
        path: 'promotions',
        loadComponent: () =>
          import('./pages/admin-promotions.page').then(
            (m) => m.AdminPromotionsPage,
          ),
      },
    ],
  },
];
