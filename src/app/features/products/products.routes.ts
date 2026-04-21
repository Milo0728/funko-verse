import { Routes } from '@angular/router';

export const PRODUCTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/catalog.page').then((m) => m.CatalogPage),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/product-detail.page').then((m) => m.ProductDetailPage),
  },
];
