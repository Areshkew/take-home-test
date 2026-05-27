import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AUTH_REPOSITORY } from '../../domain/repositories/auth-repository.port';
import { ToastService } from '../services/toast.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authRepo = inject(AUTH_REPOSITORY);
  const toast = inject(ToastService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let message = 'An unexpected error occurred';

      if (error.error?.message) {
        message = error.error.message;
      } else if (error.status === 0) {
        message = 'Unable to connect to the server. Is the backend running?';
      } else if (error.status === 401) {
        message = 'Session expired. Please log in again.';
        authRepo.logout();
        router.navigate(['/login']);
      } else if (error.status === 404) {
        message = 'Resource not found.';
      }

      toast.error(message);
      return throwError(() => error);
    })
  );
};
