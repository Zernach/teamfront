using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartScheduler.Commands;
using SmartScheduler.DTOs;
using SmartScheduler.Models;
using SmartScheduler.Queries;

namespace SmartScheduler.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ContractorsController : ControllerBase
{
    private readonly IMediator _mediator;

    public ContractorsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    [ProducesResponseType(typeof(PagedResult<ContractorListItemDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<PagedResult<ContractorListItemDto>>> ListContractors(
        [FromQuery] string? name = null,
        [FromQuery] ContractorType? type = null,
        [FromQuery] decimal? minRating = null,
        [FromQuery] decimal? maxRating = null,
        [FromQuery] string? city = null,
        [FromQuery] string? state = null,
        [FromQuery] bool includeInactive = false,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var query = new ListContractorsQuery
        {
            Name = name,
            Type = type,
            MinRating = minRating,
            MaxRating = maxRating,
            City = city,
            State = state,
            IncludeInactive = includeInactive,
            Page = page,
            PageSize = pageSize
        };
        
        var result = await _mediator.Send(query, cancellationToken);
        return Ok(result);
    }

    [HttpPost]
    [ProducesResponseType(typeof(CreateContractorResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<CreateContractorResponse>> CreateContractor(
        [FromBody] CreateContractorCommand command,
        CancellationToken cancellationToken)
    {
        var response = await _mediator.Send(command, cancellationToken);
        return CreatedAtAction(
            nameof(GetContractor),
            new { id = response.Id },
            response);
    }

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ContractorDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ContractorDetailDto>> GetContractor(
        Guid id,
        CancellationToken cancellationToken)
    {
        var query = new GetContractorByIdQuery { Id = id };
        var contractor = await _mediator.Send(query, cancellationToken);
        
        if (contractor == null)
        {
            return NotFound();
        }
        
        return Ok(contractor);
    }

    [HttpPut("{id}")]
    [ProducesResponseType(typeof(UpdateContractorResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<UpdateContractorResponse>> UpdateContractor(
        Guid id,
        [FromBody] UpdateContractorCommand command,
        CancellationToken cancellationToken)
    {
        command.Id = id;
        
        try
        {
            var response = await _mediator.Send(command, cancellationToken);
            return Ok(response);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (DbUpdateConcurrencyException)
        {
            return Conflict(new { message = "Contractor has been modified by another user. Please refresh and try again." });
        }
    }

    [HttpDelete("{id}")]
    [ProducesResponseType(typeof(DeactivateContractorResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<DeactivateContractorResponse>> DeactivateContractor(
        Guid id,
        CancellationToken cancellationToken)
    {
        try
        {
            var command = new DeactivateContractorCommand { Id = id };
            var response = await _mediator.Send(command, cancellationToken);
            return Ok(response);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("{id}/restore")]
    [ProducesResponseType(typeof(RestoreContractorResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<RestoreContractorResponse>> RestoreContractor(
        Guid id,
        CancellationToken cancellationToken)
    {
        try
        {
            var command = new RestoreContractorCommand { Id = id };
            var response = await _mediator.Send(command, cancellationToken);
            return Ok(response);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }
}

