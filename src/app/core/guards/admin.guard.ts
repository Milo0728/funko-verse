import { inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { CanActivateFn, Router } from '@angular/router';
import { filter, map, take } from 'rxjs';

import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

/**
 * Acceso solo para administradores. Espera a que el perfil enriquecido
 * se haya leído de Firestore antes de decidir (isAdmin depende de él).
 */
export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const toast = inject(ToastService);

  return toObservable(auth.loading).pipe(
    filter((loading) => loading === false),
    take(1),
    map(() => {
      if (!auth.isLogged()) {
        return router.createUrlTree(['/auth/login']);
      }
      if (auth.isAdmin()) return true;
      toast.error('No tienes permisos para acceder al panel de administración');
      return router.createUrlTree(['/']);
    }),
  );
};
