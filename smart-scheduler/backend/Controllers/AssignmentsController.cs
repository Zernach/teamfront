using MediatR;
using Microsoft.AspNetCore.Mvc;
using SmartScheduler.Commands;

namespace SmartScheduler.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AssignmentsController : ControllerBase
{
    private readonly IMediator _mediator;

    public AssignmentsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    [ProducesResponseType(typeof(CreateAssignmentResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<CreateAssignmentResponse>> CreateAssignment(
        [FromBody] CreateAssignmentCommand command,
        CancellationToken cancellationToken)
    {
        try
        {
            var response = await _mediator.Send(command, cancellationToken);
            return CreatedAtAction(
                nameof(GetAssignment),
                new { id = response.Id },
                response);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(CreateAssignmentResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public ActionResult<CreateAssignmentResponse> GetAssignment(
        Guid id)
    {
        // TODO: Implement GetAssignmentQuery
        return NotFound();
    }
}

