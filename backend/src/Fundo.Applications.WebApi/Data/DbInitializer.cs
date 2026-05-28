using Fundo.Application.Interfaces;
using Fundo.Domain.Entities;
using Fundo.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Fundo.Applications.WebApi.Data;

public static class DbInitializer
{
    public static async Task SeedAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<LoanDbContext>();
        var authService = scope.ServiceProvider.GetRequiredService<IAuthService>();

        if (context.Database.ProviderName != "Microsoft.EntityFrameworkCore.InMemory" &&
            context.Database.ProviderName != "Microsoft.EntityFrameworkCore.Sqlite")
        {
            await context.Database.MigrateAsync();
        }

        if (!await context.Users.AnyAsync())
        {
            context.Users.Add(new User
            {
                Id = Guid.NewGuid(),
                Email = "admin@fundo.com",
                PasswordHash = authService.HashPassword("P@ssw0rd!"),
                Role = "Admin"
            });
        }

        if (!await context.Loans.AnyAsync())
        {
            var loan1 = Loan.Create(25000m, "John Doe");
            loan1.ApplyPayment(6250m, Guid.NewGuid().ToString()); // balance 18750
            context.Loans.Add(loan1);

            var loan2 = Loan.Create(15000m, "Jane Smith");
            loan2.ApplyPayment(15000m, Guid.NewGuid().ToString()); // balance 0, Paid
            context.Loans.Add(loan2);

            var loan3 = Loan.Create(50000m, "Robert Johnson");
            loan3.ApplyPayment(17500m, Guid.NewGuid().ToString()); // balance 32500
            context.Loans.Add(loan3);
        }

        await context.SaveChangesAsync();
    }
}
