using MediatR;
using Microsoft.EntityFrameworkCore;
using SmartScheduler.Data;
using SmartScheduler.DTOs;
using SmartScheduler.Models;
using SmartScheduler.Queries;

namespace SmartScheduler.Handlers;

public class ListJobsHandler : IRequestHandler<ListJobsQuery, PagedResult<JobListItemDto>>
{
    private readonly ApplicationDbContext _context;

    public ListJobsHandler(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<PagedResult<JobListItemDto>> Handle(ListJobsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Jobs.AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.ToLower();
            query = query.Where(j => 
                j.JobNumber.ToLower().Contains(search) ||
                j.Location.Address.ToLower().Contains(search) ||
                j.Location.City.ToLower().Contains(search));
        }

        if (request.Status.HasValue)
        {
            query = query.Where(j => j.Status == request.Status.Value);
        }

        if (request.Type.HasValue)
        {
            query = query.Where(j => j.Type == request.Type.Value);
        }

        if (request.StartDate.HasValue)
        {
            query = query.Where(j => j.DesiredDate >= request.StartDate.Value);
        }

        if (request.EndDate.HasValue)
        {
            query = query.Where(j => j.DesiredDate <= request.EndDate.Value);
        }

        var totalCount = await query.CountAsync(cancellationToken);
        var totalPages = (int)Math.Ceiling(totalCount / (double)request.PageSize);

        var jobs = await query
            .OrderByDescending(j => j.CreatedAt)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(j => new JobListItemDto
            {
                Id = j.Id,
                JobNumber = j.JobNumber,
                Type = j.Type,
                Status = j.Status,
                DesiredDate = j.DesiredDate,
                Duration = j.Duration,
                Priority = j.Priority,
                Address = j.Location.Address,
                City = j.Location.City,
                State = j.Location.State,
                AssignedContractorId = j.AssignedContractorId,
                AssignedContractorName = j.AssignedContractor != null ? j.AssignedContractor.Name : null
            })
            .ToListAsync(cancellationToken);

        return new PagedResult<JobListItemDto>
        {
            Data = jobs,
            CurrentPage = request.Page,
            PageSize = request.PageSize,
            TotalPages = totalPages,
            TotalCount = totalCount
        };
    }
}

public class GetJobByIdHandler : IRequestHandler<GetJobByIdQuery, JobDetailDto?>
{
    private readonly ApplicationDbContext _context;

    public GetJobByIdHandler(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<JobDetailDto?> Handle(GetJobByIdQuery request, CancellationToken cancellationToken)
    {
        var job = await _context.Jobs
            .Include(j => j.AssignedContractor)
            .FirstOrDefaultAsync(j => j.Id == request.Id, cancellationToken);

        if (job == null)
            return null;

        return new JobDetailDto
        {
            Id = job.Id,
            JobNumber = job.JobNumber,
            Type = job.Type,
            Status = job.Status,
            DesiredDate = job.DesiredDate,
            Duration = job.Duration,
            Priority = job.Priority,
            Location = job.Location,
            SpecialRequirements = job.SpecialRequirements,
            AssignedContractorId = job.AssignedContractorId,
            AssignedContractorName = job.AssignedContractor?.Name,
            CreatedAt = job.CreatedAt,
            UpdatedAt = job.UpdatedAt
        };
    }
}

