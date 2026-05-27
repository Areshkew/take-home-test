export interface Payment {
  id: string;
  loanId: string;
  amount: number;
  paidAt: string;
}

export interface Loan {
  id: string;
  amount: number;
  currentBalance: number;
  applicantName: string;
  status: 'Active' | 'Paid';
  createdAt: string;
  payments: Payment[];
}

export interface PaginatedList<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface CreateLoanRequest {
  amount: number;
  applicantName: string;
}

export interface MakePaymentRequest {
  amount: number;
  idempotencyKey: string;
}

export interface ListLoansQuery {
  pageNumber: number;
  pageSize: number;
}
