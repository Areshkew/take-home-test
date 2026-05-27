namespace Fundo.Domain.Entities;

public class Payment
{
    public Guid Id { get; private set; }
    public Guid LoanId { get; private set; }
    public Loan? Loan { get; private set; }
    public decimal Amount { get; private set; }
    public DateTime PaidAt { get; private set; }
    public string IdempotencyKey { get; private set; } = string.Empty;

    private Payment() { }

    public static Payment Create(Guid loanId, decimal amount, string idempotencyKey)
    {
        if (amount <= 0) throw new ArgumentException("Payment amount must be greater than zero.", nameof(amount));
        if (string.IsNullOrWhiteSpace(idempotencyKey)) throw new ArgumentException("Idempotency key is required.", nameof(idempotencyKey));

        return new Payment
        {
            LoanId = loanId,
            Amount = amount,
            PaidAt = DateTime.UtcNow,
            IdempotencyKey = idempotencyKey
        };
    }

    public void SetLoan(Loan loan)
    {
        Loan = loan;
        LoanId = loan.Id;
    }
}
