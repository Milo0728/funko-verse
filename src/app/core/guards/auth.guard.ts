import { inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { CanActivateFn, Router } from '@angular/router';
import { filter, map, take } from 'rxjs';

import { AuthService } from '../services/auth.service';

/**
 * Protege rutas privadas. Espera a que AuthService termine de restaurar la
 * sesión (el primer `loading === false`) antes de decidir — evita rebotes
 * al login cuando Firebase aún no ha hidratado el usuario desde IndexedDB.
 */
export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return toObservable(auth.loading).pipe(
    filter((loading) => loading === false),
    take(1),
    map(() =>
      auth.isLogged()
        ? true
        : router.createUrlTree(['/auth/login'], {
            queryParams: { returnUrl: state.url },
          }),
    ),
  );
};
