import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LOAN_REPOSITORY, LoanRepository } from '../../domain/repositories/loan-repository.port';
import { Loan } from '../../domain/entities/loan.entity';
import { Money } from '../../domain/value-objects/money.vo';

export interface CreateLoanCommand {
  amount: number;
  applicantName: string;
}

@Injectable({ providedIn: 'root' })
export class CreateLoanUseCase {
  private loanRepo = inject<LoanRepository>(LOAN_REPOSITORY);

  execute(command: CreateLoanCommand): Observable<Loan> {
    const loan = Loan.create(command.amount, command.applicantName);
    return this.loanRepo.create(loan.amount, loan.applicantName);
  }
}
