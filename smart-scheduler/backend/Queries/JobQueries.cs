using MediatR;
using SmartScheduler.DTOs;
using SmartScheduler.Models;

namespace SmartScheduler.Queries;

public class ListJobsQuery : IRequest<PagedResult<JobListItemDto>>
{
    public string? Search { get; set; }
    public JobStatus? Status { get; set; }
    public JobType? Type { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}

public class GetJobByIdQuery : IRequest<JobDetailDto?>
{
    public Guid Id { get; set; }
}

