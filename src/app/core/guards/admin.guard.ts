import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

/**
 * Permite el acceso solo a usuarios con rol `admin`.
 * Requiere que el AuthService haya terminado de resolver el perfil.
 */
export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const toast = inject(ToastService);

  if (!auth.isLogged()) {
    return router.createUrlTree(['/auth/login']);
  }
  if (auth.isAdmin()) return true;

  toast.error('No tienes permisos para acceder al panel de administración');
  return router.createUrlTree(['/']);
};
