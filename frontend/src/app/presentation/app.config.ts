import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { LOAN_REPOSITORY } from '../domain/repositories/loan-repository.port';
import { AUTH_REPOSITORY } from '../domain/repositories/auth-repository.port';
import { HttpLoanRepository } from '../infrastructure/repositories/http-loan.repository';
import { LocalAuthRepository } from '../infrastructure/repositories/local-auth.repository';
import { authInterceptor } from '../infrastructure/interceptors/auth.interceptor';
import { errorInterceptor } from '../infrastructure/interceptors/error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
    { provide: LOAN_REPOSITORY, useClass: HttpLoanRepository },
    { provide: AUTH_REPOSITORY, useClass: LocalAuthRepository },
  ],
};
