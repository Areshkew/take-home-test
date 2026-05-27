using Fundo.Application.DTOs;
using MediatR;

namespace Fundo.Application.Commands;

public class MakePaymentCommand : IRequest<LoanDto>
{
    public Guid LoanId { get; set; }
    public decimal Amount { get; set; }
    public string IdempotencyKey { get; set; } = string.Empty;
}
