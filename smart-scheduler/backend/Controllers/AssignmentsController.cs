using MediatR;
using Microsoft.AspNetCore.Mvc;
using SmartScheduler.Commands;

namespace SmartScheduler.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AssignmentsController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ILogger<AssignmentsController> _logger;

    public AssignmentsController(IMediator mediator, ILogger<AssignmentsController> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    [HttpPost]
    [ProducesResponseType(typeof(CreateAssignmentResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<CreateAssignmentResponse>> CreateAssignment(
        [FromBody] CreateAssignmentCommand command,
        CancellationToken cancellationToken)
    {
        var requestId = HttpContext.Items["RequestId"]?.ToString() ?? "unknown";
        _logger.LogInformation("[RequestId: {RequestId}] CreateAssignment called with jobId={JobId}, contractorId={ContractorId}", 
            requestId, command.JobId, command.ContractorId);

        try
        {
            var response = await _mediator.Send(command, cancellationToken);
            _logger.LogInformation("[RequestId: {RequestId}] CreateAssignment completed successfully, created assignment {AssignmentId}", 
                requestId, response.Id);
            return CreatedAtAction(
                nameof(GetAssignment),
                new { id = response.Id },
                response);
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, "[RequestId: {RequestId}] CreateAssignment: Resource not found for jobId={JobId}, contractorId={ContractorId}", 
                requestId, command.JobId, command.ContractorId);
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "[RequestId: {RequestId}] CreateAssignment: Invalid operation for jobId={JobId}, contractorId={ContractorId}", 
                requestId, command.JobId, command.ContractorId);
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[RequestId: {RequestId}] CreateAssignment: Unexpected error for jobId={JobId}, contractorId={ContractorId}", 
                requestId, command.JobId, command.ContractorId);
            return StatusCode(500, new { message = "An error occurred while processing your request." });
        }
    }

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(CreateAssignmentResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public ActionResult<CreateAssignmentResponse> GetAssignment(
        Guid id)
    {
        var requestId = HttpContext.Items["RequestId"]?.ToString() ?? "unknown";
        _logger.LogWarning("[RequestId: {RequestId}] GetAssignment called for assignment {AssignmentId} - Not implemented", requestId, id);
        // TODO: Implement GetAssignmentQuery
        return NotFound(new { message = "GetAssignment endpoint is not yet implemented" });
    }
}

