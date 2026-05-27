import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { CheckAuthUseCase } from '../../application/use-cases/check-auth.use-case';

export const authGuard: CanActivateFn = () => {
  const checkAuth = inject(CheckAuthUseCase);
  const router = inject(Router);

  if (checkAuth.execute()) {
    return true;
  }

  return router.createUrlTree(['/login']);
};
