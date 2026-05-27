import { Loan } from '../../domain/entities/loan.entity';
import { Payment } from '../../domain/entities/payment.entity';
import { LoanStatus } from '../../domain/enums/loan-status.enum';

// DTO interfaces (internal to infrastructure)
interface PaymentDto {
  id: string;
  loanId: string;
  amount: number;
  paidAt: string;
}

interface LoanDto {
  id: string;
  amount: number;
  currentBalance: number;
  applicantName: string;
  status: 'Active' | 'Paid';
  createdAt: string;
  payments: PaymentDto[];
}

export class LoanMapper {
  static toDomain(dto: LoanDto): Loan {
    return Loan.reconstitute(
      dto.id,
      dto.amount,
      dto.currentBalance,
      dto.applicantName,
      dto.status as LoanStatus,
      dto.createdAt,
      dto.payments.map(p => this.toPaymentDomain(p))
    );
  }

  private static toPaymentDomain(dto: PaymentDto): Payment {
    return Payment.reconstitute(
      dto.id,
      dto.loanId,
      dto.amount,
      dto.paidAt
    );
  }
}
