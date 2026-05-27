using Fundo.Application.DTOs;
using MediatR;

namespace Fundo.Application.Queries;

public class GetLoanByIdQuery : IRequest<LoanDto?>
{
    public Guid Id { get; set; }

    public GetLoanByIdQuery(Guid id)
    {
        Id = id;
    }
}
