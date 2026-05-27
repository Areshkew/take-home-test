import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AUTH_REPOSITORY } from '../../domain/repositories/auth-repository.port';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authRepo = inject(AUTH_REPOSITORY);
  const token = authRepo.getToken();

  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }

  return next(req);
};
