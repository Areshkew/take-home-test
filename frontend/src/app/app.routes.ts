import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./components/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'loans',
    loadComponent: () =>
      import('./components/loans/loans.component').then((m) => m.LoansComponent),
    canActivate: [authGuard],
  },
  { path: '', redirectTo: '/loans', pathMatch: 'full' },
  { path: '**', redirectTo: '/loans' },
];
