import { Money } from '../value-objects/money.vo';

export class Payment {
  private constructor(
    public readonly id: string,
    public readonly loanId: string,
    public readonly amount: Money,
    public readonly paidAt: Date
  ) {}

  static create(loanId: string, amount: Money): Payment {
    return new Payment('', loanId, amount, new Date());
  }

  static reconstitute(
    id: string,
    loanId: string,
    amount: number,
    paidAt: string
  ): Payment {
    return new Payment(id, loanId, Money.create(amount), new Date(paidAt));
  }
}
