using Fundo.Domain.Entities;
using Fundo.Domain.Interfaces;
using Fundo.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Fundo.Infrastructure.Repositories;

public class LoanRepository : ILoanRepository
{
    private readonly LoanDbContext _context;

    public LoanRepository(LoanDbContext context)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
    }

    public async Task<Loan?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Loans
            .FirstOrDefaultAsync(l => l.Id == id, cancellationToken);
    }

    public async Task<Loan?> GetByIdWithPaymentsAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Loans
            .AsNoTracking()
            .Include(l => l.Payments)
            .FirstOrDefaultAsync(l => l.Id == id, cancellationToken);
    }

    public async Task<(IReadOnlyList<Loan> Items, int TotalCount)> ListAsync(int pageNumber, int pageSize, CancellationToken cancellationToken = default)
    {
        var query = _context.Loans.AsNoTracking().OrderByDescending(l => l.CreatedAt);
        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Include(l => l.Payments)
            .ToListAsync(cancellationToken);
        return (items, totalCount);
    }

    public async Task AddAsync(Loan loan, CancellationToken cancellationToken = default)
    {
        await _context.Loans.AddAsync(loan, cancellationToken);
    }

    public async Task<bool> ExistsPaymentByIdempotencyKeyAsync(string idempotencyKey, CancellationToken cancellationToken = default)
    {
        return await _context.Payments.AnyAsync(p => p.IdempotencyKey == idempotencyKey, cancellationToken);
    }
}
