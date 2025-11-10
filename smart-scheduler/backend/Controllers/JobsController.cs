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

    public JobsController(IMediator mediator)
    {
        _mediator = mediator;
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
        return Ok(result);
    }

    [HttpPost]
    [ProducesResponseType(typeof(CreateJobResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<CreateJobResponse>> CreateJob(
        [FromBody] CreateJobCommand command,
        CancellationToken cancellationToken)
    {
        var response = await _mediator.Send(command, cancellationToken);
        return CreatedAtAction(
            nameof(GetJob),
            new { id = response.Id },
            response);
    }

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(JobDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<JobDetailDto>> GetJob(
        Guid id,
        CancellationToken cancellationToken)
    {
        var query = new GetJobByIdQuery { Id = id };
        var job = await _mediator.Send(query, cancellationToken);

        if (job == null)
            return NotFound();

        return Ok(job);
    }
}

