using AutoMapper;
using FluentAssertions;
using Fundo.Application.Commands;
using Fundo.Application.DTOs;
using Fundo.Application.Mappings;
using Fundo.Domain.Entities;
using Fundo.Domain.Interfaces;
using Moq;
using Xunit;

namespace Fundo.Services.Tests.Unit.Application.Commands;

public class CreateLoanCommandHandlerTests
{
    private readonly Mock<ILoanRepository> _loanRepoMock;
    private readonly Mock<IUnitOfWork> _unitOfWorkMock;
    private readonly IMapper _mapper;
    private readonly CreateLoanCommandHandler _handler;

    public CreateLoanCommandHandlerTests()
    {
        _loanRepoMock = new Mock<ILoanRepository>();
        _unitOfWorkMock = new Mock<IUnitOfWork>();
        _mapper = new MapperConfiguration(cfg => cfg.AddProfile<MappingProfile>()).CreateMapper();
        _handler = new CreateLoanCommandHandler(_loanRepoMock.Object, _unitOfWorkMock.Object, _mapper);
    }

    [Fact]
    public async Task Handle_WithValidCommand_ShouldCreateLoanAndReturnDto()
    {
        var command = new CreateLoanCommand { Amount = 5000m, ApplicantName = "Test User" };
        Loan? capturedLoan = null;
        _loanRepoMock.Setup(r => r.AddAsync(It.IsAny<Loan>(), It.IsAny<CancellationToken>()))
            .Callback<Loan, CancellationToken>((l, _) => capturedLoan = l)
            .Returns(Task.CompletedTask);
        _unitOfWorkMock.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);

        var result = await _handler.Handle(command, CancellationToken.None);

        result.Should().NotBeNull();
        result.Amount.Should().Be(5000m);
        result.ApplicantName.Should().Be("Test User");
        result.CurrentBalance.Should().Be(5000m);
        result.Status.Should().Be(global::Fundo.Domain.Enums.LoanStatus.Active);
        capturedLoan.Should().NotBeNull();
        capturedLoan!.ApplicantName.Should().Be("Test User");
        _loanRepoMock.Verify(r => r.AddAsync(It.IsAny<Loan>(), It.IsAny<CancellationToken>()), Times.Once);
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
