using MediatR;
using Microsoft.AspNetCore.Mvc;
using SmartScheduler.Queries;

namespace SmartScheduler.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RecommendationsController : ControllerBase
{
    private readonly IMediator _mediator;

    public RecommendationsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    [ProducesResponseType(typeof(RecommendationResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<RecommendationResponse>> GetRecommendations(
        [FromQuery] Guid jobId,
        [FromQuery] int maxResults = 10,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var query = new GetRecommendationsQuery
            {
                JobId = jobId,
                MaxResults = Math.Min(maxResults, 50) // Cap at 50
            };

            var result = await _mediator.Send(query, cancellationToken);
            return Ok(result);
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
}

