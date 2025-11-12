using MediatR;
using Microsoft.AspNetCore.Mvc;
using SmartScheduler.Commands;
using SmartScheduler.DTOs;
using SmartScheduler.Models;
using SmartScheduler.Queries;

namespace SmartScheduler.Controllers;

[ApiController]
[Route("api/[controller]")]
public class JobsController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ILogger<JobsController> _logger;

    public JobsController(IMediator mediator, ILogger<JobsController> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    [HttpGet]
    [ProducesResponseType(typeof(PagedResult<JobListItemDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<PagedResult<JobListItemDto>>> ListJobs(
        [FromQuery] string? search = null,
        [FromQuery] JobStatus? status = null,
        [FromQuery] JobType? type = null,
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var requestId = HttpContext.Items["RequestId"]?.ToString() ?? "unknown";
        _logger.LogInformation("[RequestId: {RequestId}] ListJobs called with search={Search}, status={Status}, type={Type}, page={Page}, pageSize={PageSize}",
            requestId, search, status, type, page, pageSize);
        
        try
        {
            var query = new ListJobsQuery
            {
                Search = search,
                Status = status,
                Type = type,
                StartDate = startDate,
                EndDate = endDate,
                Page = page,
                PageSize = pageSize
            };

            var result = await _mediator.Send(query, cancellationToken);
            _logger.LogInformation("[RequestId: {RequestId}] ListJobs completed successfully, returned {Count} items",
                requestId, result.Data.Count);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[RequestId: {RequestId}] Error in ListJobs", requestId);
            throw;
        }
    }

    [HttpPost]
    [ProducesResponseType(typeof(CreateJobResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<CreateJobResponse>> CreateJob(
        [FromBody] CreateJobCommand command,
        CancellationToken cancellationToken)
    {
        var requestId = HttpContext.Items["RequestId"]?.ToString() ?? "unknown";
        _logger.LogInformation("[RequestId: {RequestId}] CreateJob called", requestId);
        
        try
        {
            var response = await _mediator.Send(command, cancellationToken);
            _logger.LogInformation("[RequestId: {RequestId}] CreateJob completed successfully, created job {JobId}",
                requestId, response.Id);
            return CreatedAtAction(
                nameof(GetJob),
                new { id = response.Id },
                response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[RequestId: {RequestId}] Error in CreateJob", requestId);
            throw;
        }
    }

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(JobDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<JobDetailDto>> GetJob(
        Guid id,
        CancellationToken cancellationToken)
    {
        var requestId = HttpContext.Items["RequestId"]?.ToString() ?? "unknown";
        _logger.LogInformation("[RequestId: {RequestId}] GetJob called with id={JobId}", requestId, id);
        
        try
        {
            var query = new GetJobByIdQuery { Id = id };
            var job = await _mediator.Send(query, cancellationToken);

            if (job == null)
            {
                _logger.LogWarning("[RequestId: {RequestId}] GetJob: Job {JobId} not found", requestId, id);
                return NotFound();
            }

            _logger.LogInformation("[RequestId: {RequestId}] GetJob completed successfully for job {JobId}", requestId, id);
            return Ok(job);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[RequestId: {RequestId}] Error in GetJob for job {JobId}", requestId, id);
            throw;
        }
    }
}

