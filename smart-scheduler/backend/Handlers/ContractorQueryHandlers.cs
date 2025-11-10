using MediatR;
using Microsoft.EntityFrameworkCore;
using SmartScheduler.Data;
using SmartScheduler.DTOs;
using SmartScheduler.Models;
using SmartScheduler.Queries;

namespace SmartScheduler.Handlers;

public class GetContractorByIdHandler : IRequestHandler<GetContractorByIdQuery, ContractorDetailDto?>
{
    private readonly ApplicationDbContext _context;

    public GetContractorByIdHandler(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<ContractorDetailDto?> Handle(GetContractorByIdQuery request, CancellationToken cancellationToken)
    {
        var contractor = await _context.Contractors
            .Include(c => c.WorkingHours)
            .FirstOrDefaultAsync(c => c.Id == request.Id, cancellationToken);

        if (contractor == null)
        {
            return null;
        }

        // Calculate availability status (simplified - always "Available" for now)
        // TODO: Implement actual availability calculation in Story 2-1
        var availabilityStatus = contractor.Status == ContractorStatus.Active ? "Available" : "Unavailable";

        // Calculate statistics (simplified - placeholder values)
        // TODO: Implement actual job history aggregation when Jobs table exists
        var statistics = new ContractorStatisticsDto
        {
            TotalJobs = 0,
            CompletedJobs = 0,
            PendingJobs = 0,
            AverageRating = contractor.Rating
        };

        return new ContractorDetailDto
        {
            Id = contractor.Id,
            Name = contractor.Name,
            Type = contractor.Type,
            Rating = contractor.Rating,
            Status = contractor.Status,
            PhoneNumber = contractor.PhoneNumber,
            Email = contractor.Email,
            BaseLocation = contractor.BaseLocation,
            Skills = contractor.Skills,
            WorkingHours = contractor.WorkingHours.Select(wh => new WorkingHoursDto
            {
                DayOfWeek = wh.DayOfWeek,
                StartTime = wh.StartTime,
                EndTime = wh.EndTime
            }).ToList(),
            AvailabilityStatus = availabilityStatus,
            Statistics = statistics,
            CreatedAt = contractor.CreatedAt,
            UpdatedAt = contractor.UpdatedAt
        };
    }
}

public class ListContractorsHandler : IRequestHandler<ListContractorsQuery, PagedResult<ContractorListItemDto>>
{
    private readonly ApplicationDbContext _context;

    public ListContractorsHandler(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<PagedResult<ContractorListItemDto>> Handle(ListContractorsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Contractors.AsQueryable();

        // Exclude inactive contractors by default (soft delete)
        if (!request.IncludeInactive)
        {
            query = query.Where(c => c.Status != ContractorStatus.Inactive);
        }

        // Apply filters
        if (!string.IsNullOrWhiteSpace(request.Name))
        {
            query = query.Where(c => c.Name.Contains(request.Name));
        }

        if (request.Type.HasValue)
        {
            query = query.Where(c => c.Type == request.Type.Value);
        }

        if (request.MinRating.HasValue)
        {
            query = query.Where(c => c.Rating >= request.MinRating.Value);
        }

        if (request.MaxRating.HasValue)
        {
            query = query.Where(c => c.Rating <= request.MaxRating.Value);
        }

        if (!string.IsNullOrWhiteSpace(request.City))
        {
            query = query.Where(c => c.BaseLocation.City == request.City);
        }

        if (!string.IsNullOrWhiteSpace(request.State))
        {
            query = query.Where(c => c.BaseLocation.State == request.State);
        }

        // Get total count before pagination
        var totalCount = await query.CountAsync(cancellationToken);

        // Apply pagination
        var contractors = await query
            .OrderBy(c => c.Name)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);

        var items = contractors.Select(c => new ContractorListItemDto
        {
            Id = c.Id,
            Name = c.Name,
            Type = c.Type,
            Rating = c.Rating,
            Status = c.Status,
            PhoneNumber = c.PhoneNumber,
            Email = c.Email,
            City = c.BaseLocation.City,
            State = c.BaseLocation.State,
            AvailabilityStatus = c.Status == ContractorStatus.Active ? "Available" : "Unavailable"
        }).ToList();

        return new PagedResult<ContractorListItemDto>
        {
            Data = items,
            TotalCount = totalCount,
            CurrentPage = request.Page,
            PageSize = request.PageSize,
            TotalPages = (int)Math.Ceiling(totalCount / (double)request.PageSize)
        };
    }
}

