using Fundo.Application.DTOs;
using MediatR;

namespace Fundo.Application.Queries;

public class ListLoansQuery : IRequest<PaginatedList<LoanDto>>
{
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}
