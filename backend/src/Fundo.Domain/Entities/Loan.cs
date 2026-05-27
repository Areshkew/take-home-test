using Fundo.Domain.Enums;
using Fundo.Domain.Events;

namespace Fundo.Domain.Entities;

public class Loan
{
    public Guid Id { get; private set; }
    public decimal Amount { get; private set; }
    public decimal CurrentBalance { get; private set; }
    public string ApplicantName { get; private set; } = string.Empty;
    public LoanStatus Status { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public ICollection<Payment> Payments { get; private set; } = new List<Payment>();

    private Loan() { }

    public static Loan Create(decimal amount, string applicantName)
    {
        if (amount <= 0) throw new ArgumentException("Loan amount must be greater than zero.", nameof(amount));
        if (string.IsNullOrWhiteSpace(applicantName)) throw new ArgumentException("Applicant name is required.", nameof(applicantName));

        return new Loan
        {
            Id = Guid.NewGuid(),
            Amount = amount,
            CurrentBalance = amount,
            ApplicantName = applicantName,
            Status = LoanStatus.Active,
            CreatedAt = DateTime.UtcNow
        };
    }

    public Payment ApplyPayment(decimal paymentAmount, string idempotencyKey)
    {
        if (Status == LoanStatus.Paid)
            throw new InvalidOperationException("Cannot apply payment to a fully paid loan.");

        if (paymentAmount <= 0)
            throw new ArgumentException("Payment amount must be greater than zero.", nameof(paymentAmount));

        if (paymentAmount > CurrentBalance)
            throw new InvalidOperationException("Payment amount exceeds current balance.");

        var payment = Payment.Create(Id, paymentAmount, idempotencyKey);
        payment.SetLoan(this);
        Payments.Add(payment);

        CurrentBalance -= paymentAmount;

        if (CurrentBalance == 0)
            Status = LoanStatus.Paid;

        // Domain event would be raised here in a more complete event dispatching setup
        return payment;
    }
}
