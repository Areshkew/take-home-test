import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { LoginUseCase } from '../../../application/use-cases/login.use-case';
import { ToastService } from '../../../infrastructure/services/toast.service';

@Component({
  selector: 'app-login',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div class="w-full max-w-sm space-y-6">
        <div class="text-center space-y-2">
          <div class="flex justify-center">
            <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M5 21V7l8-4 8 4v14"/><path d="M14 21v-5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v5"/></svg>
            </div>
          </div>
          <h1 class="text-2xl font-semibold tracking-tight text-slate-900">Fundo</h1>
          <p class="text-sm text-slate-500">Sign in to manage loans</p>
        </div>

        <form (ngSubmit)="login()" class="space-y-4">
          <div class="space-y-2">
            <label for="email" class="text-sm font-medium text-slate-700">Email</label>
            <input
              id="email" type="email" [(ngModel)]="email" name="email"
              placeholder="admin@fundo.com" required [disabled]="isLoading()"
              class="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div class="space-y-2">
            <label for="password" class="text-sm font-medium text-slate-700">Password</label>
            <input
              id="password" type="password" [(ngModel)]="password" name="password"
              placeholder="P@ssw0rd!" required [disabled]="isLoading()"
              class="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          @if (errorMessage()) {
            <p class="text-sm text-red-600">{{ errorMessage() }}</p>
          }

          <button
            type="submit" [disabled]="isLoading()"
            class="inline-flex h-10 w-full items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow transition-colors hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            @if (isLoading()) {
              <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            } @else {
              Sign In
            }
          </button>
        </form>
      </div>
    </div>
  `,
})
export class LoginComponent {
  private loginUseCase = inject(LoginUseCase);
  private router = inject(Router);
  private toast = inject(ToastService);

  email = signal('admin@fundo.com');
  password = signal('P@ssw0rd!');
  isLoading = signal(false);
  errorMessage = signal('');

  async login(): Promise<void> {
    if (!this.email() || !this.password()) {
      this.errorMessage.set('Please enter both email and password');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    try {
      await firstValueFrom(
        this.loginUseCase.execute({ email: this.email(), password: this.password() })
      );
      this.router.navigate(['/loans']);
    } catch (err: any) {
      this.errorMessage.set(err.error?.message || 'Invalid credentials');
    } finally {
      this.isLoading.set(false);
    }
  }
}
