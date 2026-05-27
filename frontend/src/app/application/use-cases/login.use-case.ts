import { inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { AUTH_REPOSITORY, AuthRepository, AuthCredentials } from '../../domain/repositories/auth-repository.port';

@Injectable({ providedIn: 'root' })
export class LoginUseCase {
  private authRepo = inject<AuthRepository>(AUTH_REPOSITORY);

  execute(credentials: AuthCredentials): Observable<{ token: string; email: string }> {
    return this.authRepo.login(credentials);
  }
}
