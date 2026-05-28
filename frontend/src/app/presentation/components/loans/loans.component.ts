import { Component, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs';
import { Loan } from '../../../domain/entities/loan.entity';
import { LoanStatus } from '../../../domain/enums/loan-status.enum';
import { PaginatedList } from '../../../domain/models/paginated-list';
import { ListLoansUseCase } from '../../../application/use-cases/list-loans.use-case';
import { CreateLoanUseCase } from '../../../application/use-cases/create-loan.use-case';
import { MakePaymentUseCase } from '../../../application/use-cases/make-payment.use-case';
import { LogoutUseCase } from '../../../application/use-cases/logout.use-case';
import { ToastService } from '../../../infrastructure/services/toast.service';

@Component({
  selector: 'app-loans',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, CurrencyPipe, DatePipe],
  templateUrl: './loans.component.html',
  styleUrls: ['./loans.component.scss'],
})
export class LoansComponent {
  private listLoans = inject(ListLoansUseCase);
  private createLoanUseCase = inject(CreateLoanUseCase);
  private makePaymentUseCase = inject(MakePaymentUseCase);
  private logoutUseCase = inject(LogoutUseCase);
  private toast = inject(ToastService);

  // Pagination state
  pageNumber = signal(1);
  pageSize = signal(10);
  private refreshTrigger = signal(0);

  // Trigger signal that drives the reactive fetch pipeline
  private query = computed(() => ({
    pageNumber: this.pageNumber(),
    pageSize: this.pageSize(),
    refresh: this.refreshTrigger(),
  }));

  private loansResult$ = toObservable(this.query).pipe(
    switchMap(q => this.listLoans.execute(q))
  );

  loansResult = toSignal(this.loansResult$);

  loans = computed(() => this.loansResult()?.items ?? []);
  totalCount = computed(() => this.loansResult()?.totalCount ?? 0);
  totalPages = computed(() => this.loansResult()?.totalPages ?? 0);
  hasPreviousPage = computed(() => this.pageNumber() > 1);
  hasNextPage = computed(() => this.pageNumber() < this.totalPages());

  // Windowed pagination: show pages in a sliding window
  visiblePages = computed(() => {
    const current = this.pageNumber();
    const total = this.totalPages();
    const maxVisible = 7;

    if (total <= maxVisible) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    let start = Math.max(1, current - 3);
    let end = Math.min(total, start + maxVisible - 1);

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  });

  showLeftEllipsis = computed(() => this.visiblePages()[0] > 1);
  showRightEllipsis = computed(() => {
    const pages = this.visiblePages();
    return pages[pages.length - 1] < this.totalPages();
  });

  pageSizeOptions = [10, 25, 50, 100, 200];
  customPageSize = signal<number | null>(null);
  showCustomPageSize = signal(false);

  // Create loan form
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

  applyCustomPageSize(): void {
    const size = this.customPageSize();
    if (size && size > 0 && size <= 1000) {
      this.setPageSize(size);
      this.showCustomPageSize.set(false);
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.pageNumber.set(page);
    }
  }

  goFirst(): void {
    this.pageNumber.set(1);
  }

  goLast(): void {
    this.pageNumber.set(this.totalPages());
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
      this.toast.error('Please enter a valid amount and applicant name');
      return;
    }

    this.isCreating.set(true);
    try {
      await new Promise<void>((resolve, reject) => {
        this.createLoanUseCase.execute({ amount, applicantName: applicant }).subscribe({
          next: () => {
            this.newAmount.set(null);
            this.newApplicant.set('');
            this.toast.success('Loan created successfully');
            this.pageNumber.set(1);
            this.refreshTrigger.update(n => n + 1);
            resolve();
          },
          error: reject,
        });
      });
    } catch {
      // Error interceptor handles HTTP errors
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
      this.toast.error('Please enter a valid payment amount');
      return;
    }

    this.isPaying.set(true);
    try {
      await new Promise<void>((resolve, reject) => {
        this.makePaymentUseCase.execute({
          loanId,
          amount,
          idempotencyKey: `${loanId}-${Date.now()}`,
        }).subscribe({
          next: () => {
            this.paymentLoanId.set(null);
            this.paymentAmount.set(null);
            this.toast.success('Payment applied successfully');
            this.refreshTrigger.update(n => n + 1);
            resolve();
          },
          error: reject,
        });
      });
    } catch {
      // Error interceptor handles HTTP errors
    } finally {
      this.isPaying.set(false);
    }
  }

  toggleDetails(loanId: string): void {
    this.expandedLoanId.set(this.expandedLoanId() === loanId ? null : loanId);
  }

  canPay(loan: Loan): boolean {
    return loan.status === LoanStatus.Active && loan.currentBalance.toNumber() > 0;
  }

  payButtonTitle(loan: Loan): string {
    if (loan.status === LoanStatus.Paid) return 'Loan is fully paid';
    if (loan.currentBalance.toNumber() <= 0) return 'No balance remaining';
    return 'Make a payment';
  }

  logout(): void {
    this.logoutUseCase.execute();
  }
}
