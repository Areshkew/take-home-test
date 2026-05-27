using System;
using FluentAssertions;
using Fundo.Domain.ValueObjects;
using Xunit;

namespace Fundo.Services.Tests.Unit.Domain.ValueObjects;

public class MoneyTests
{
    [Fact]
    public void Create_WithPositiveAmount_ShouldSetProperties()
    {
        var money = new Money(100.50m, "USD");

        money.Amount.Should().Be(100.50m);
        money.Currency.Should().Be("USD");
    }

    [Fact]
    public void Create_WithDefaultCurrency_ShouldBeUSD()
    {
        var money = new Money(50m);

        money.Currency.Should().Be("USD");
    }

    [Fact]
    public void Create_WithNegativeAmount_ShouldThrowArgumentException()
    {
        Action act = () => new Money(-10m);

        act.Should().Throw<ArgumentException>()
            .WithMessage("*cannot be negative*");
    }

    [Fact]
    public void Create_WithEmptyCurrency_ShouldThrowArgumentException()
    {
        Action act = () => new Money(10m, " ");

        act.Should().Throw<ArgumentException>()
            .WithMessage("*Currency is required*");
    }

    [Fact]
    public void Zero_ShouldReturnMoneyWithZeroAmount()
    {
        var zero = Money.Zero("EUR");

        zero.Amount.Should().Be(0m);
        zero.Currency.Should().Be("EUR");
    }

    [Fact]
    public void Add_SameCurrency_ShouldReturnSum()
    {
        var a = new Money(100m, "USD");
        var b = new Money(50m, "USD");

        var result = a.Add(b);

        result.Amount.Should().Be(150m);
        result.Currency.Should().Be("USD");
    }

    [Fact]
    public void Add_DifferentCurrency_ShouldThrowInvalidOperationException()
    {
        var usd = new Money(100m, "USD");
        var eur = new Money(50m, "EUR");

        Action act = () => usd.Add(eur);

        act.Should().Throw<InvalidOperationException>()
            .WithMessage("*different currencies*");
    }

    [Fact]
    public void Subtract_SameCurrency_ShouldReturnDifference()
    {
        var a = new Money(100m, "USD");
        var b = new Money(30m, "USD");

        var result = a.Subtract(b);

        result.Amount.Should().Be(70m);
    }

    [Fact]
    public void Subtract_WhenAmountExceedsBalance_ShouldThrowInvalidOperationException()
    {
        var a = new Money(50m, "USD");
        var b = new Money(100m, "USD");

        Action act = () => a.Subtract(b);

        act.Should().Throw<InvalidOperationException>()
            .WithMessage("*Insufficient funds*");
    }

    [Fact]
    public void IsLessThanOrEqualTo_WhenLess_ShouldReturnTrue()
    {
        var a = new Money(50m, "USD");
        var b = new Money(100m, "USD");

        a.IsLessThanOrEqualTo(b).Should().BeTrue();
    }

    [Fact]
    public void IsLessThanOrEqualTo_WhenEqual_ShouldReturnTrue()
    {
        var a = new Money(100m, "USD");
        var b = new Money(100m, "USD");

        a.IsLessThanOrEqualTo(b).Should().BeTrue();
    }

    [Fact]
    public void IsLessThanOrEqualTo_WhenGreater_ShouldReturnFalse()
    {
        var a = new Money(200m, "USD");
        var b = new Money(100m, "USD");

        a.IsLessThanOrEqualTo(b).Should().BeFalse();
    }

    [Fact]
    public void Equality_SameAmountAndCurrency_ShouldBeEqual()
    {
        var a = new Money(100m, "USD");
        var b = new Money(100m, "USD");

        a.Should().Be(b);
        (a == b).Should().BeTrue();
    }

    [Fact]
    public void Equality_DifferentAmount_ShouldNotBeEqual()
    {
        var a = new Money(100m, "USD");
        var b = new Money(200m, "USD");

        a.Should().NotBe(b);
        (a != b).Should().BeTrue();
    }
}
