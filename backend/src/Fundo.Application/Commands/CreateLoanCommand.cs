using Fundo.Application.DTOs;
using MediatR;

namespace Fundo.Application.Commands;

public class CreateLoanCommand : IRequest<LoanDto>
{
    public decimal Amount { get; set; }
    public string ApplicantName { get; set; } = string.Empty;
}
