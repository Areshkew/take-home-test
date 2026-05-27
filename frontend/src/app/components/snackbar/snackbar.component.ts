import { Component, Inject, signal } from '@angular/core';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';

export interface SnackbarData {
  message: string;
  type: 'success' | 'error' | 'info';
}

@Component({
  selector: 'app-snackbar',
  template: `
    <div
      class="flex items-center gap-3 rounded-lg px-4 py-3 shadow-lg min-w-[300px]"
      [class.bg-emerald-50]="type() === 'success'"
      [class.border]="type() === 'success'"
      [class.border-emerald-200]="type() === 'success'"
      [class.bg-red-50]="type() === 'error'"
      [class.border]="type() === 'error'"
      [class.border-red-200]="type() === 'error'"
      [class.bg-slate-50]="type() === 'info'"
      [class.border]="type() === 'info'"
      [class.border-slate-200]="type() === 'info'"
    >
      @if (type() === 'success') {
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#15803d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
      } @else if (type() === 'error') {
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" x2="9" y1="9" y2="15"/><line x1="9" x2="15" y1="9" y2="15"/></svg>
      } @else {
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#475569" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="16" y2="12"/><line x1="12" x2="12.01" y1="8" y2="8"/></svg>
      }

      <span
        class="text-sm font-medium flex-1"
        [class.text-emerald-800]="type() === 'success'"
        [class.text-red-800]="type() === 'error'"
        [class.text-slate-800]="type() === 'info'"
      >
        {{ message() }}
      </span>

      <button
        (click)="dismiss()"
        class="inline-flex h-6 w-6 items-center justify-center rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
      </button>
    </div>
  `,
})
export class SnackbarComponent {
  message = signal('');
  type = signal<SnackbarData['type']>('info');

  constructor(
    @Inject(MAT_SNACK_BAR_DATA) private data: SnackbarData,
    private snackBarRef: MatSnackBarRef<SnackbarComponent>
  ) {
    this.message.set(this.data.message);
    this.type.set(this.data.type);
  }

  dismiss(): void {
    this.snackBarRef.dismiss();
  }
}
