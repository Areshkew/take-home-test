using Fundo.Domain.Entities;
using Fundo.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Fundo.Infrastructure.Persistence.Configurations;

public class LoanConfiguration : IEntityTypeConfiguration<Loan>
{
    public void Configure(EntityTypeBuilder<Loan> builder)
    {
        builder.HasKey(l => l.Id);
        builder.Property(l => l.Amount).HasPrecision(18, 2);
        builder.Property(l => l.CurrentBalance).HasPrecision(18, 2);
        builder.Property(l => l.ApplicantName).HasMaxLength(200).IsRequired();
        builder.Property(l => l.Status).HasConversion<string>().HasMaxLength(50);
        builder.HasMany(l => l.Payments).WithOne(p => p.Loan).HasForeignKey(p => p.LoanId).OnDelete(DeleteBehavior.Cascade);
    }
}
