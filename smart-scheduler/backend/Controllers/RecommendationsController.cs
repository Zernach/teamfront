using MediatR;
using Microsoft.AspNetCore.Mvc;
using SmartScheduler.Queries;

namespace SmartScheduler.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RecommendationsController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ILogger<RecommendationsController> _logger;

    public RecommendationsController(IMediator mediator, ILogger<RecommendationsController> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    [HttpGet]
    [ProducesResponseType(typeof(RecommendationResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<RecommendationResponse>> GetRecommendations(
        [FromQuery] string? jobId = null,
        [FromQuery] int maxResults = 10,
        CancellationToken cancellationToken = default)
    {
        var requestId = HttpContext.Items["RequestId"]?.ToString() ?? "unknown";
        
        // Validate jobId parameter
        if (string.IsNullOrWhiteSpace(jobId))
        {
            _logger.LogWarning("[RequestId: {RequestId}] GetRecommendations called without jobId", requestId);
            return BadRequest(new { message = "jobId query parameter is required" });
        }

        if (!Guid.TryParse(jobId, out var parsedJobId))
        {
            _logger.LogWarning("[RequestId: {RequestId}] GetRecommendations called with invalid jobId format: {JobId}", requestId, jobId);
            return BadRequest(new { message = $"Invalid jobId format: {jobId}. Expected a valid GUID." });
        }

        _logger.LogInformation("[RequestId: {RequestId}] GetRecommendations called with jobId={JobId}, maxResults={MaxResults}", 
            requestId, parsedJobId, maxResults);

        try
        {
            var query = new GetRecommendationsQuery
            {
                JobId = parsedJobId,
                MaxResults = Math.Min(maxResults, 50) // Cap at 50
            };

            var result = await _mediator.Send(query, cancellationToken);
            _logger.LogInformation("[RequestId: {RequestId}] GetRecommendations completed successfully for jobId={JobId}", 
                requestId, parsedJobId);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, "[RequestId: {RequestId}] GetRecommendations: Job {JobId} not found", requestId, parsedJobId);
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "[RequestId: {RequestId}] GetRecommendations: Invalid operation for jobId={JobId}", requestId, parsedJobId);
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[RequestId: {RequestId}] GetRecommendations: Unexpected error for jobId={JobId}", requestId, parsedJobId);
            return StatusCode(500, new { message = "An error occurred while processing your request." });
        }
    }
}

