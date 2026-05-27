using Fundo.Application.Commands;
using Fundo.Application.DTOs;
using Fundo.Application.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Fundo.Applications.WebApi.Controllers;

[ApiController]
[Route("api/loans")]
[Authorize]
public class LoanManagementController : ControllerBase
{
    private readonly IMediator _mediator;

    public LoanManagementController(IMediator mediator)
    {
        _mediator = mediator ?? throw new ArgumentNullException(nameof(mediator));
    }

    [HttpPost]
    public async Task<ActionResult<LoanDto>> Create([FromBody] CreateLoanCommand command)
    {
        var result = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpGet]
    public async Task<ActionResult<PaginatedList<LoanDto>>> List([FromQuery] ListLoansQuery query)
    {
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<LoanDto>> GetById(Guid id)
    {
        var result = await _mediator.Send(new GetLoanByIdQuery(id));
        if (result is null) return NotFound();
        return Ok(result);
    }

    [HttpPost("{id:guid}/payment")]
    public async Task<ActionResult<LoanDto>> Payment(Guid id, [FromBody] MakePaymentCommand command)
    {
        command.LoanId = id;
        var result = await _mediator.Send(command);
        return Ok(result);
    }
}
