using FluentValidation;
using Fundo.Application.Commands;

namespace Fundo.Application.Validators;

public class MakePaymentCommandValidator : AbstractValidator<MakePaymentCommand>
{
    public MakePaymentCommandValidator()
    {
        RuleFor(x => x.LoanId).NotEmpty().WithMessage("Loan id is required.");
        RuleFor(x => x.Amount).GreaterThan(0).WithMessage("Payment amount must be greater than zero.");
        RuleFor(x => x.IdempotencyKey).NotEmpty().WithMessage("Idempotency key is required.");
    }
}
