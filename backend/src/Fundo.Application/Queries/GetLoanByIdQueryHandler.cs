using AutoMapper;
using Fundo.Application.DTOs;
using Fundo.Domain.Interfaces;
using MediatR;

namespace Fundo.Application.Queries;

public class GetLoanByIdQueryHandler : IRequestHandler<GetLoanByIdQuery, LoanDto?>
{
    private readonly ILoanRepository _loanRepository;
    private readonly IMapper _mapper;

    public GetLoanByIdQueryHandler(ILoanRepository loanRepository, IMapper mapper)
    {
        _loanRepository = loanRepository ?? throw new ArgumentNullException(nameof(loanRepository));
        _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
    }

    public async Task<LoanDto?> Handle(GetLoanByIdQuery request, CancellationToken cancellationToken)
    {
        var loan = await _loanRepository.GetByIdWithPaymentsAsync(request.Id, cancellationToken);
        return loan is null ? null : _mapper.Map<LoanDto>(loan);
    }
}
