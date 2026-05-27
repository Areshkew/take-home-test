import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarComponent, SnackbarData } from '../components/snackbar/snackbar.component';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private snackBar = inject(MatSnackBar);

  private show(message: string, type: SnackbarData['type'], duration: number = 4000): void {
    this.snackBar.openFromComponent(SnackbarComponent, {
      data: { message, type } as SnackbarData,
      duration,
      panelClass: ['tailwind-snackbar'],
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }

  success(message: string, duration?: number): void {
    this.show(message, 'success', duration);
  }

  error(message: string, duration?: number): void {
    this.show(message, 'error', duration ?? 6000);
  }

  info(message: string, duration?: number): void {
    this.show(message, 'info', duration);
  }
}
