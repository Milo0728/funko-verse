import { inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { CanActivateFn, Router } from '@angular/router';
import { filter, map, take } from 'rxjs';

import { AuthService } from '../services/auth.service';

/**
 * Bloquea páginas de login/registro si ya hay sesión activa.
 * Espera a que el estado de auth esté resuelto para no mostrar el login
 * un instante a usuarios que ya están logueados.
 */
export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return toObservable(auth.loading).pipe(
    filter((loading) => loading === false),
    take(1),
    map(() => (auth.isLogged() ? router.createUrlTree(['/']) : true)),
  );
};
