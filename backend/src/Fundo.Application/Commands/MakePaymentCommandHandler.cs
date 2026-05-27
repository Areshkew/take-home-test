using AutoMapper;
using Fundo.Application.DTOs;
using Fundo.Domain.Interfaces;
using MediatR;

namespace Fundo.Application.Commands;

public class MakePaymentCommandHandler : IRequestHandler<MakePaymentCommand, LoanDto>
{
    private readonly ILoanRepository _loanRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public MakePaymentCommandHandler(ILoanRepository loanRepository, IUnitOfWork unitOfWork, IMapper mapper)
    {
        _loanRepository = loanRepository ?? throw new ArgumentNullException(nameof(loanRepository));
        _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));
        _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
    }

    public async Task<LoanDto> Handle(MakePaymentCommand request, CancellationToken cancellationToken)
    {
        var loan = await _loanRepository.GetByIdAsync(request.LoanId, cancellationToken);
        if (loan is null)
            throw new KeyNotFoundException($"Loan with id {request.LoanId} not found.");

        var alreadyProcessed = await _loanRepository.ExistsPaymentByIdempotencyKeyAsync(request.IdempotencyKey, cancellationToken);
        if (alreadyProcessed)
            throw new InvalidOperationException("Payment with this idempotency key has already been processed.");

        loan.ApplyPayment(request.Amount, request.IdempotencyKey);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return _mapper.Map<LoanDto>(loan);
    }
}
