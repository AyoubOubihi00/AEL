import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../service/auth.service';

export const gardeAuthentification: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.utilisateurSignal()) {
    return router.parseUrl('/connexion');
  }

  return true;
};
