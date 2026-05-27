using FluentValidation;
using Fundo.Application.Commands;

namespace Fundo.Application.Validators;

public class CreateLoanCommandValidator : AbstractValidator<CreateLoanCommand>
{
    public CreateLoanCommandValidator()
    {
        RuleFor(x => x.Amount).GreaterThan(0).WithMessage("Loan amount must be greater than zero.");
        RuleFor(x => x.ApplicantName).NotEmpty().WithMessage("Applicant name is required.");
    }
}
