using System.Data.Common;
using Fundo.Application.Interfaces;
using Fundo.Domain.Entities;
using Fundo.Infrastructure.Persistence;
using Fundo.Infrastructure.Services;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Fundo.Services.Tests.Integration;

public class CustomWebApplicationFactory : WebApplicationFactory<global::Fundo.Applications.WebApi.Startup>
{
    private readonly DbConnection _connection;

    public CustomWebApplicationFactory()
    {
        _connection = new SqliteConnection("DataSource=:memory:");
        _connection.Open();
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");

        builder.ConfigureServices(services =>
        {
            // Remove the real DbContext registration
            var descriptor = services.SingleOrDefault(
                d => d.ServiceType == typeof(DbContextOptions<LoanDbContext>));
            if (descriptor != null)
                services.Remove(descriptor);

            services.AddDbContext<LoanDbContext>(options =>
            {
                options.UseSqlite(_connection);
            });

            // Ensure auth service is available
            services.AddScoped<IAuthService, JwtAuthService>();
        });
    }

    protected override IHost CreateHost(IHostBuilder builder)
    {
        var host = base.CreateHost(builder);

        using var scope = host.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<LoanDbContext>();
        var auth = scope.ServiceProvider.GetRequiredService<IAuthService>();
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<CustomWebApplicationFactory>>();

        try
        {
            db.Database.EnsureCreated();
            SeedTestData(db, auth);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred seeding the test database.");
            throw;
        }

        return host;
    }

    private static void SeedTestData(LoanDbContext context, IAuthService authService)
    {
        if (!context.Users.Any())
        {
            context.Users.Add(new User
            {
                Id = Guid.NewGuid(),
                Email = "admin@fundo.com",
                PasswordHash = authService.HashPassword("P@ssw0rd!"),
                Role = "Admin"
            });
        }

        if (!context.Loans.Any())
        {
            var loan1 = Loan.Create(25000m, "John Doe");
            loan1.ApplyPayment(6250m, Guid.NewGuid().ToString());
            context.Loans.Add(loan1);

            var loan2 = Loan.Create(15000m, "Jane Smith");
            loan2.ApplyPayment(15000m, Guid.NewGuid().ToString());
            context.Loans.Add(loan2);

            var loan3 = Loan.Create(50000m, "Robert Johnson");
            loan3.ApplyPayment(17500m, Guid.NewGuid().ToString());
            context.Loans.Add(loan3);
        }

        context.SaveChanges();
    }

    protected override void Dispose(bool disposing)
    {
        if (disposing)
        {
            _connection.Close();
            _connection.Dispose();
        }
        base.Dispose(disposing);
    }
}
