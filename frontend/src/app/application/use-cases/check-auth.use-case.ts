import { inject, Injectable } from '@angular/core';
import { AUTH_REPOSITORY, AuthRepository } from '../../domain/repositories/auth-repository.port';

@Injectable({ providedIn: 'root' })
export class CheckAuthUseCase {
  private authRepo = inject<AuthRepository>(AUTH_REPOSITORY);

  execute(): boolean {
    return this.authRepo.isAuthenticated();
  }
}
