using AutoMapper;
using Fundo.Application.DTOs;
using Fundo.Domain.Interfaces;
using MediatR;

namespace Fundo.Application.Queries;

public class ListLoansQueryHandler : IRequestHandler<ListLoansQuery, PaginatedList<LoanDto>>
{
    private readonly ILoanRepository _loanRepository;
    private readonly IMapper _mapper;

    public ListLoansQueryHandler(ILoanRepository loanRepository, IMapper mapper)
    {
        _loanRepository = loanRepository ?? throw new ArgumentNullException(nameof(loanRepository));
        _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
    }

    public async Task<PaginatedList<LoanDto>> Handle(ListLoansQuery request, CancellationToken cancellationToken)
    {
        var (items, totalCount) = await _loanRepository.ListAsync(request.PageNumber, request.PageSize, cancellationToken);
        var dtos = _mapper.Map<IReadOnlyList<LoanDto>>(items);
        return new PaginatedList<LoanDto>(dtos, totalCount, request.PageNumber, request.PageSize);
    }
}
