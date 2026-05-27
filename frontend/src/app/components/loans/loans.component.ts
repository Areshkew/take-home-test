import { Component, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { LoanService } from '../../services/loan.service';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { Loan, PaginatedList, MakePaymentRequest } from '../../models/loan.model';

@Component({
  selector: 'app-loans',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    CurrencyPipe,
    DatePipe,
  ],
  templateUrl: './loans.component.html',
  styleUrls: ['./loans.component.scss'],
})
export class LoansComponent {
  private loanService = inject(LoanService);
  private authService = inject(AuthService);
  private notification = inject(NotificationService);

  pageNumber = signal(1);
  pageSize = signal(10);

  loansResource = httpResource<PaginatedList<Loan>>(() => ({
    url: 'http://localhost:5000/api/loans',
    method: 'GET',
    params: {
      pageNumber: this.pageNumber().toString(),
      pageSize: this.pageSize().toString(),
    },
  }));

  loans = computed(() => this.loansResource.value()?.items ?? []);
  totalCount = computed(() => this.loansResource.value()?.totalCount ?? 0);
  totalPages = computed(() => this.loansResource.value()?.totalPages ?? 0);
  hasPreviousPage = computed(() => this.pageNumber() > 1);
  hasNextPage = computed(() => this.pageNumber() < this.totalPages());
  isLoading = computed(() => this.loansResource.isLoading());

  pageSizeOptions = [5, 10, 25];

  // Create loan
  newAmount = signal<number | null>(null);
  newApplicant = signal('');
  isCreating = signal(false);

  // Payment
  paymentLoanId = signal<string | null>(null);
  paymentAmount = signal<number | null>(null);
  isPaying = signal(false);

  // Detail view
  expandedLoanId = signal<string | null>(null);

  setPageSize(size: number): void {
    this.pageSize.set(size);
    this.pageNumber.set(1);
  }

  goToPage(page: number): void {
    this.pageNumber.set(page);
  }

  goPrevious(): void {
    if (this.hasPreviousPage()) {
      this.pageNumber.update(p => p - 1);
    }
  }

  goNext(): void {
    if (this.hasNextPage()) {
      this.pageNumber.update(p => p + 1);
    }
  }

  async createLoan(): Promise<void> {
    const amount = this.newAmount();
    const applicant = this.newApplicant().trim();
    if (!amount || amount <= 0 || !applicant) {
      this.notification.error('Please enter a valid amount and applicant name');
      return;
    }

    this.isCreating.set(true);
    try {
      await firstValueFrom(this.loanService.createLoan({ amount, applicantName: applicant }));
      this.newAmount.set(null);
      this.newApplicant.set('');
      this.notification.success('Loan created successfully');
      this.loansResource.reload();
    } finally {
      this.isCreating.set(false);
    }
  }

  startPayment(loanId: string): void {
    this.paymentLoanId.set(loanId);
    this.paymentAmount.set(null);
  }

  cancelPayment(): void {
    this.paymentLoanId.set(null);
    this.paymentAmount.set(null);
  }

  async makePayment(loanId: string): Promise<void> {
    const amount = this.paymentAmount();
    if (!amount || amount <= 0) {
      this.notification.error('Please enter a valid payment amount');
      return;
    }

    const request: MakePaymentRequest = {
      amount,
      idempotencyKey: `${loanId}-${Date.now()}`,
    };

    this.isPaying.set(true);
    try {
      await firstValueFrom(this.loanService.makePayment(loanId, request));
      this.paymentLoanId.set(null);
      this.paymentAmount.set(null);
      this.notification.success('Payment applied successfully');
      this.loansResource.reload();
    } finally {
      this.isPaying.set(false);
    }
  }

  toggleDetails(loanId: string): void {
    this.expandedLoanId.set(this.expandedLoanId() === loanId ? null : loanId);
  }

  canPay(loan: Loan): boolean {
    return loan.status === 'Active' && loan.currentBalance > 0;
  }

  payButtonTitle(loan: Loan): string {
    if (loan.status === 'Paid') return 'Loan is fully paid';
    if (loan.currentBalance <= 0) return 'No balance remaining';
    return 'Make a payment';
  }

  logout(): void {
    this.authService.logout();
  }
}
