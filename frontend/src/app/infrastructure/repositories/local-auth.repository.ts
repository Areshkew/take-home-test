import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AuthRepository, AuthCredentials, AuthResult } from '../../domain/repositories/auth-repository.port';

const TOKEN_KEY = 'fundo_token';

@Injectable()
export class LocalAuthRepository implements AuthRepository {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5000/api/auth';

  login(credentials: AuthCredentials): Observable<AuthResult> {
    return this.http.post<AuthResult>(`${this.apiUrl}/login`, credentials).pipe(
      tap(result => {
        localStorage.setItem(TOKEN_KEY, result.token);
      })
    );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
  }

  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }
}
