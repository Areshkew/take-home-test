import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const snackBar = inject(MatSnackBar);
  const authService = inject(AuthService);

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

      snackBar.open(message, 'Dismiss', {
        duration: 5000,
        panelClass: ['error-snackbar'],
      });

      return throwError(() => error);
    })
  );
};
