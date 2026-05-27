import { ValidationError } from '../errors/validation.error';

export class Money {
  private constructor(
    public readonly amount: number,
    public readonly currency: string = 'USD'
  ) {}

  static create(amount: number, currency: string = 'USD'): Money {
    if (amount < 0) {
      throw new ValidationError('Amount cannot be negative');
    }
    if (!Number.isFinite(amount)) {
      throw new ValidationError('Amount must be a valid number');
    }
    return new Money(amount, currency);
  }

  static zero(currency: string = 'USD'): Money {
    return new Money(0, currency);
  }

  greaterThan(other: Money): boolean {
    return this.amount > other.amount;
  }

  lessThanOrEqual(other: Money): boolean {
    return this.amount <= other.amount;
  }

  subtract(other: Money): Money {
    return new Money(this.amount - other.amount, this.currency);
  }

  toNumber(): number {
    return this.amount;
  }

  equals(other: Money): boolean {
    return this.amount === other.amount && this.currency === other.currency;
  }
}
