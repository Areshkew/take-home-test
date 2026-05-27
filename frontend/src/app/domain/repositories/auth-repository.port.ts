import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface AuthResult {
  token: string;
  email: string;
}

export interface AuthRepository {
  login(credentials: AuthCredentials): Observable<AuthResult>;
  logout(): void;
  getToken(): string | null;
  isAuthenticated(): boolean;
}

export const AUTH_REPOSITORY = new InjectionToken<AuthRepository>('AuthRepository');
