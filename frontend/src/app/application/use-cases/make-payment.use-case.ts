import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LOAN_REPOSITORY, LoanRepository } from '../../domain/repositories/loan-repository.port';
import { Loan } from '../../domain/entities/loan.entity';
import { Money } from '../../domain/value-objects/money.vo';

export interface MakePaymentCommand {
  loanId: string;
  amount: number;
  idempotencyKey: string;
}

@Injectable({ providedIn: 'root' })
export class MakePaymentUseCase {
  private loanRepo = inject<LoanRepository>(LOAN_REPOSITORY);

  execute(command: MakePaymentCommand): Observable<Loan> {
    const amount = Money.create(command.amount);
    return this.loanRepo.makePayment(command.loanId, amount, command.idempotencyKey);
  }
}
