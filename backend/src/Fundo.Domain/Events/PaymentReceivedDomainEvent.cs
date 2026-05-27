using Fundo.Domain.Entities;

namespace Fundo.Domain.Events;

public class PaymentReceivedDomainEvent
{
    public Guid LoanId { get; }
    public Payment Payment { get; }

    public PaymentReceivedDomainEvent(Guid loanId, Payment payment)
    {
        LoanId = loanId;
        Payment = payment;
    }
}
