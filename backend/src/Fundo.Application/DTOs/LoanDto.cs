using Fundo.Domain.Enums;

namespace Fundo.Application.DTOs;

public class LoanDto
{
    public Guid Id { get; set; }
    public decimal Amount { get; set; }
    public decimal CurrentBalance { get; set; }
    public string ApplicantName { get; set; } = string.Empty;
    public LoanStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<PaymentDto> Payments { get; set; } = new();
}
