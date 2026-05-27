import { Money } from '../value-objects/money.vo';
import { Payment } from './payment.entity';
import { LoanStatus } from '../enums/loan-status.enum';
import { ValidationError } from '../errors/validation.error';
import { DomainError } from '../errors/domain.error';

export class Loan {
  private constructor(
    public readonly id: string,
    public readonly amount: Money,
    public readonly currentBalance: Money,
    public readonly applicantName: string,
    public readonly status: LoanStatus,
    public readonly createdAt: Date,
    public readonly payments: ReadonlyArray<Payment>
  ) {}

  static create(amount: number, applicantName: string): Loan {
    const name = applicantName?.trim();
    if (!name) {
      throw new ValidationError('Applicant name is required');
    }
    const money = Money.create(amount);
    return new Loan(
      '',
      money,
      money,
      name,
      LoanStatus.Active,
      new Date(),
      []
    );
  }

  static reconstitute(
    id: string,
    amount: number,
    currentBalance: number,
    applicantName: string,
    status: LoanStatus,
    createdAt: string,
    payments: ReadonlyArray<Payment>
  ): Loan {
    return new Loan(
      id,
      Money.create(amount),
      Money.create(currentBalance),
      applicantName,
      status,
      new Date(createdAt),
      payments
    );
  }

  canApplyPayment(amount: Money): boolean {
    return (
      this.status === LoanStatus.Active &&
      this.currentBalance.greaterThan(Money.zero()) &&
      amount.greaterThan(Money.zero()) &&
      amount.lessThanOrEqual(this.currentBalance)
    );
  }

  validatePayment(amount: Money): void {
    if (this.status === LoanStatus.Paid) {
      throw new DomainError('Cannot apply payment to a fully paid loan');
    }
    if (!amount.greaterThan(Money.zero())) {
      throw new ValidationError('Payment amount must be greater than zero');
    }
    if (amount.greaterThan(this.currentBalance)) {
      throw new ValidationError('Payment amount exceeds current balance');
    }
  }
}
