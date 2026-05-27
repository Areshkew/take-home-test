import { Component, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { firstValueFrom } from 'rxjs';
import { LoanService } from '../../services/loan.service';
import { AuthService } from '../../services/auth.service';
import { Loan, PaginatedList, MakePaymentRequest } from '../../models/loan.model';

@Component({
  selector: 'app-loans',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    MatPaginatorModule,
    CurrencyPipe,
    DatePipe,
  ],
  templateUrl: './loans.component.html',
  styleUrls: ['./loans.component.scss'],
})
export class LoansComponent {
  private loanService = inject(LoanService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);

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
  isLoading = computed(() => this.loansResource.isLoading());

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

  onPageChange(event: PageEvent): void {
    this.pageNumber.set(event.pageIndex + 1);
    this.pageSize.set(event.pageSize);
  }

  async createLoan(): Promise<void> {
    const amount = this.newAmount();
    const applicant = this.newApplicant().trim();
    if (!amount || amount <= 0 || !applicant) {
      this.snackBar.open('Please enter a valid amount and applicant name', 'Dismiss', { duration: 4000, panelClass: ['error-snackbar'] });
      return;
    }

    this.isCreating.set(true);
    try {
      await firstValueFrom(this.loanService.createLoan({ amount, applicantName: applicant }));
      this.newAmount.set(null);
      this.newApplicant.set('');
      this.snackBar.open('Loan created successfully', 'Dismiss', { duration: 3000 });
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
      this.snackBar.open('Please enter a valid payment amount', 'Dismiss', { duration: 4000, panelClass: ['error-snackbar'] });
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
      this.snackBar.open('Payment applied successfully', 'Dismiss', { duration: 3000 });
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

  logout(): void {
    this.authService.logout();
  }
}
