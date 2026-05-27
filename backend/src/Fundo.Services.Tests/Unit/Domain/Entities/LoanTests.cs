using System;
using FluentAssertions;
using Fundo.Domain.Entities;
using Fundo.Domain.Enums;
using Xunit;

namespace Fundo.Services.Tests.Unit.Domain.Entities;

public class LoanTests
{
    [Fact]
    public void Create_WithValidData_ShouldSetAmountAsBalanceAndStatusActive()
    {
        var loan = Loan.Create(10000m, "John Doe");

        loan.Amount.Should().Be(10000m);
        loan.CurrentBalance.Should().Be(10000m);
        loan.ApplicantName.Should().Be("John Doe");
        loan.Status.Should().Be(LoanStatus.Active);
        loan.Payments.Should().BeEmpty();
    }

    [Fact]
    public void Create_WithZeroAmount_ShouldThrowArgumentException()
    {
        Action act = () => Loan.Create(0m, "John Doe");

        act.Should().Throw<ArgumentException>()
            .WithMessage("*amount must be greater than zero*");
    }

    [Fact]
    public void Create_WithEmptyApplicantName_ShouldThrowArgumentException()
    {
        Action act = () => Loan.Create(1000m, " ");

        act.Should().Throw<ArgumentException>()
            .WithMessage("*Applicant name is required*");
    }

    [Fact]
    public void ApplyPayment_WithValidAmount_ShouldReduceBalance()
    {
        var loan = Loan.Create(10000m, "John Doe");

        loan.ApplyPayment(2500m, "key-1");

        loan.CurrentBalance.Should().Be(7500m);
        loan.Status.Should().Be(LoanStatus.Active);
        loan.Payments.Should().HaveCount(1);
    }

    [Fact]
    public void ApplyPayment_WhenBalanceReachesZero_ShouldSetStatusPaid()
    {
        var loan = Loan.Create(5000m, "Jane Smith");

        loan.ApplyPayment(5000m, "key-payoff");

        loan.CurrentBalance.Should().Be(0m);
        loan.Status.Should().Be(LoanStatus.Paid);
    }

    [Fact]
    public void ApplyPayment_ToPaidLoan_ShouldThrowInvalidOperationException()
    {
        var loan = Loan.Create(1000m, "Bob");
        loan.ApplyPayment(1000m, "key-1");

        Action act = () => loan.ApplyPayment(1m, "key-2");

        act.Should().Throw<InvalidOperationException>()
            .WithMessage("*fully paid loan*");
    }

    [Fact]
    public void ApplyPayment_WithZeroAmount_ShouldThrowArgumentException()
    {
        var loan = Loan.Create(1000m, "Bob");

        Action act = () => loan.ApplyPayment(0m, "key-1");

        act.Should().Throw<ArgumentException>()
            .WithMessage("*greater than zero*");
    }

    [Fact]
    public void ApplyPayment_ExceedingBalance_ShouldThrowInvalidOperationException()
    {
        var loan = Loan.Create(1000m, "Bob");

        Action act = () => loan.ApplyPayment(1500m, "key-1");

        act.Should().Throw<InvalidOperationException>()
            .WithMessage("*exceeds current balance*");
    }

    [Fact]
    public void ApplyPayment_ShouldSetPaymentProperties()
    {
        var loan = Loan.Create(5000m, "Alice");

        var payment = loan.ApplyPayment(1000m, "key-abc");

        payment.LoanId.Should().Be(loan.Id);
        payment.Amount.Should().Be(1000m);
        payment.IdempotencyKey.Should().Be("key-abc");
        payment.PaidAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
    }

    [Fact]
    public void ApplyPayment_MultiplePayments_ShouldAccumulateCorrectly()
    {
        var loan = Loan.Create(10000m, "Alice");

        loan.ApplyPayment(3000m, "key-1");
        loan.ApplyPayment(2000m, "key-2");
        loan.ApplyPayment(5000m, "key-3");

        loan.CurrentBalance.Should().Be(0m);
        loan.Status.Should().Be(LoanStatus.Paid);
        loan.Payments.Should().HaveCount(3);
    }
}
