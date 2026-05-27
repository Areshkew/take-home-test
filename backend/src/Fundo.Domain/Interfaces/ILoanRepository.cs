using Fundo.Domain.Entities;

namespace Fundo.Domain.Interfaces;

public interface ILoanRepository
{
    Task<Loan?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Loan?> GetByIdWithPaymentsAsync(Guid id, CancellationToken cancellationToken = default);
    Task<(IReadOnlyList<Loan> Items, int TotalCount)> ListAsync(int pageNumber, int pageSize, CancellationToken cancellationToken = default);
    Task AddAsync(Loan loan, CancellationToken cancellationToken = default);
    Task<bool> ExistsPaymentByIdempotencyKeyAsync(string idempotencyKey, CancellationToken cancellationToken = default);
}
