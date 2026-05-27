import { inject, Injectable } from '@angular/core';
import { AUTH_REPOSITORY, AuthRepository } from '../../domain/repositories/auth-repository.port';

@Injectable({ providedIn: 'root' })
export class LogoutUseCase {
  private authRepo = inject<AuthRepository>(AUTH_REPOSITORY);

  execute(): void {
    this.authRepo.logout();
  }
}
