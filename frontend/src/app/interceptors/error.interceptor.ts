import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const notification = inject(NotificationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let message = 'An unexpected error occurred';

      if (error.error?.message) {
        message = error.error.message;
      } else if (error.status === 0) {
        message = 'Unable to connect to the server. Is the backend running?';
      } else if (error.status === 401) {
        message = 'Session expired. Please log in again.';
        authService.logout();
      } else if (error.status === 404) {
        message = 'Resource not found.';
      }

      notification.error(message);
      return throwError(() => error);
    })
  );
};
