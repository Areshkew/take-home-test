import { Component, computed, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { CheckAuthUseCase } from '../application/use-cases/check-auth.use-case';
import { LogoutUseCase } from '../application/use-cases/logout.use-case';
import { ToastContainerComponent } from './components/toast-container/toast-container.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastContainerComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  private checkAuth = inject(CheckAuthUseCase);
  private logoutUseCase = inject(LogoutUseCase);
  private router = inject(Router);

  isAuthenticated = computed(() => this.checkAuth.execute());

  logout(): void {
    this.logoutUseCase.execute();
    this.router.navigate(['/login']);
  }
}
