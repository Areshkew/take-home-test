import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LOAN_REPOSITORY } from '../../domain/repositories/loan-repository.port';
import { LoanRepository } from '../../domain/repositories/loan-repository.port';
import { PaginatedList } from '../../domain/models/paginated-list';
import { Loan } from '../../domain/entities/loan.entity';

export interface ListLoansQuery {
  pageNumber: number;
  pageSize: number;
}

@Injectable({ providedIn: 'root' })
export class ListLoansUseCase {
  private loanRepo = inject<LoanRepository>(LOAN_REPOSITORY);

  execute(query: ListLoansQuery): Observable<PaginatedList<Loan>> {
    return this.loanRepo.list(query.pageNumber, query.pageSize);
  }
}
