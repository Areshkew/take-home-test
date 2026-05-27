using AutoMapper;
using Fundo.Application.DTOs;
using Fundo.Domain.Entities;
using Fundo.Domain.Interfaces;
using MediatR;

namespace Fundo.Application.Commands;

public class CreateLoanCommandHandler : IRequestHandler<CreateLoanCommand, LoanDto>
{
    private readonly ILoanRepository _loanRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public CreateLoanCommandHandler(ILoanRepository loanRepository, IUnitOfWork unitOfWork, IMapper mapper)
    {
        _loanRepository = loanRepository ?? throw new ArgumentNullException(nameof(loanRepository));
        _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));
        _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
    }

    public async Task<LoanDto> Handle(CreateLoanCommand request, CancellationToken cancellationToken)
    {
        var loan = Loan.Create(request.Amount, request.ApplicantName);
        await _loanRepository.AddAsync(loan, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return _mapper.Map<LoanDto>(loan);
    }
}
