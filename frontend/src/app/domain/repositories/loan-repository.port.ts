import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { Loan } from '../entities/loan.entity';
import { Money } from '../value-objects/money.vo';
import { PaginatedList } from '../models/paginated-list';

export interface LoanRepository {
  list(pageNumber: number, pageSize: number): Observable<PaginatedList<Loan>>;
  getById(id: string): Observable<Loan>;
  create(amount: Money, applicantName: string): Observable<Loan>;
  makePayment(loanId: string, amount: Money, idempotencyKey: string): Observable<Loan>;
}

export const LOAN_REPOSITORY = new InjectionToken<LoanRepository>('LoanRepository');
