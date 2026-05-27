import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { LoanRepository } from '../../domain/repositories/loan-repository.port';
import { Loan } from '../../domain/entities/loan.entity';
import { Money } from '../../domain/value-objects/money.vo';
import { PaginatedList } from '../../domain/models/paginated-list';
import { LoanMapper } from '../mappers/loan.mapper';

@Injectable()
export class HttpLoanRepository implements LoanRepository {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5000/api/loans';

  list(pageNumber: number, pageSize: number): Observable<PaginatedList<Loan>> {
    return this.http.get<ApiPaginatedList>(this.apiUrl, {
      params: {
        pageNumber: pageNumber.toString(),
        pageSize: pageSize.toString(),
      },
    }).pipe(map(response => this.mapPaginatedList(response)));
  }

  getById(id: string): Observable<Loan> {
    return this.http.get<LoanDto>(`${this.apiUrl}/${id}`).pipe(
      map(dto => LoanMapper.toDomain(dto))
    );
  }

  create(amount: Money, applicantName: string): Observable<Loan> {
    return this.http.post<LoanDto>(this.apiUrl, {
      amount: amount.toNumber(),
      applicantName,
    }).pipe(map(dto => LoanMapper.toDomain(dto)));
  }

  makePayment(loanId: string, amount: Money, idempotencyKey: string): Observable<Loan> {
    return this.http.post<LoanDto>(`${this.apiUrl}/${loanId}/payment`, {
      amount: amount.toNumber(),
      idempotencyKey,
    }).pipe(map(dto => LoanMapper.toDomain(dto)));
  }

  private mapPaginatedList(dto: ApiPaginatedList): PaginatedList<Loan> {
    return {
      items: dto.items.map(item => LoanMapper.toDomain(item)),
      pageNumber: dto.pageNumber,
      pageSize: dto.pageSize,
      totalCount: dto.totalCount,
      totalPages: dto.totalPages,
      hasPreviousPage: dto.hasPreviousPage,
      hasNextPage: dto.hasNextPage,
    };
  }
}

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

interface ApiPaginatedList {
  items: LoanDto[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}
