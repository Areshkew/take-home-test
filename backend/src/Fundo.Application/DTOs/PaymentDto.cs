namespace Fundo.Application.DTOs;

public class PaymentDto
{
    public Guid Id { get; set; }
    public Guid LoanId { get; set; }
    public decimal Amount { get; set; }
    public DateTime PaidAt { get; set; }
}
