using Fundo.Domain.Interfaces;

namespace Fundo.Infrastructure.Persistence;

public class UnitOfWork : IUnitOfWork
{
    private readonly LoanDbContext _context;

    public UnitOfWork(LoanDbContext context)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
    }

    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return await _context.SaveChangesAsync(cancellationToken);
    }
}
