using FluentValidation;
using Fundo.Application.Queries;

namespace Fundo.Application.Validators;

public class ListLoansQueryValidator : AbstractValidator<ListLoansQuery>
{
    public ListLoansQueryValidator()
    {
        RuleFor(x => x.PageNumber).GreaterThan(0).WithMessage("Page number must be greater than zero.");
        RuleFor(x => x.PageSize).InclusiveBetween(1, 100).WithMessage("Page size must be between 1 and 100.");
    }
}
