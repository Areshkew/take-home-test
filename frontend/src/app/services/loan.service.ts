import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Loan, PaginatedList, CreateLoanRequest, MakePaymentRequest, ListLoansQuery } from '../models/loan.model';

@Injectable({ providedIn: 'root' })
export class LoanService {
  private readonly apiUrl = 'http://localhost:5000/api/loans';

  constructor(private http: HttpClient) {}

  getLoans(query: ListLoansQuery): Observable<PaginatedList<Loan>> {
    return this.http.get<PaginatedList<Loan>>(this.apiUrl, {
      params: {
        pageNumber: query.pageNumber.toString(),
        pageSize: query.pageSize.toString(),
      },
    });
  }

  getLoan(id: string): Observable<Loan> {
    return this.http.get<Loan>(`${this.apiUrl}/${id}`);
  }

  createLoan(request: CreateLoanRequest): Observable<Loan> {
    return this.http.post<Loan>(this.apiUrl, request);
  }

  makePayment(loanId: string, request: MakePaymentRequest): Observable<Loan> {
    return this.http.post<Loan>(`${this.apiUrl}/${loanId}/payment`, request);
  }
}
