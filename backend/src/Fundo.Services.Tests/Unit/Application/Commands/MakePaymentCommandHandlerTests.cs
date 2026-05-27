using System;
using System.Threading.Tasks;
using AutoMapper;
using FluentAssertions;
using Fundo.Application.Commands;
using Fundo.Application.Mappings;
using Fundo.Domain.Entities;
using Fundo.Domain.Interfaces;
using Moq;
using Xunit;

namespace Fundo.Services.Tests.Unit.Application.Commands;

public class MakePaymentCommandHandlerTests
{
    private readonly Mock<ILoanRepository> _loanRepoMock;
    private readonly Mock<IUnitOfWork> _unitOfWorkMock;
    private readonly IMapper _mapper;
    private readonly MakePaymentCommandHandler _handler;

    public MakePaymentCommandHandlerTests()
    {
        _loanRepoMock = new Mock<ILoanRepository>();
        _unitOfWorkMock = new Mock<IUnitOfWork>();
        _mapper = new MapperConfiguration(cfg => cfg.AddProfile<MappingProfile>()).CreateMapper();
        _handler = new MakePaymentCommandHandler(_loanRepoMock.Object, _unitOfWorkMock.Object, _mapper);
    }

    [Fact]
    public async Task Handle_WithValidPayment_ShouldReduceBalanceAndReturnDto()
    {
        var loan = Loan.Create(10000m, "Test User");
        var command = new MakePaymentCommand { LoanId = loan.Id, Amount = 3000m, IdempotencyKey = "key-1" };

        _loanRepoMock.Setup(r => r.GetByIdAsync(loan.Id, It.IsAny<CancellationToken>())).ReturnsAsync(loan);
        _loanRepoMock.Setup(r => r.ExistsPaymentByIdempotencyKeyAsync("key-1", It.IsAny<CancellationToken>())).ReturnsAsync(false);
        _unitOfWorkMock.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);

        var result = await _handler.Handle(command, CancellationToken.None);

        result.Should().NotBeNull();
        result.CurrentBalance.Should().Be(7000m);
        loan.Payments.Should().HaveCount(1);
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_WhenLoanNotFound_ShouldThrowKeyNotFoundException()
    {
        var command = new MakePaymentCommand { LoanId = Guid.NewGuid(), Amount = 1000m, IdempotencyKey = "key-1" };
        _loanRepoMock.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>())).ReturnsAsync((Loan?)null);

        Func<Task> act = async () => await _handler.Handle(command, CancellationToken.None);

        await act.Should().ThrowAsync<KeyNotFoundException>().WithMessage("*not found*");
    }

    [Fact]
    public async Task Handle_WithDuplicateIdempotencyKey_ShouldThrowInvalidOperationException()
    {
        var loan = Loan.Create(5000m, "Test User");
        var command = new MakePaymentCommand { LoanId = loan.Id, Amount = 1000m, IdempotencyKey = "dup-key" };

        _loanRepoMock.Setup(r => r.GetByIdAsync(loan.Id, It.IsAny<CancellationToken>())).ReturnsAsync(loan);
        _loanRepoMock.Setup(r => r.ExistsPaymentByIdempotencyKeyAsync("dup-key", It.IsAny<CancellationToken>())).ReturnsAsync(true);

        Func<Task> act = async () => await _handler.Handle(command, CancellationToken.None);

        await act.Should().ThrowAsync<InvalidOperationException>().WithMessage("*already been processed*");
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
    }
}
