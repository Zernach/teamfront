using MediatR;
using Microsoft.EntityFrameworkCore;
using SmartScheduler.Commands;
using SmartScheduler.Data;
using SmartScheduler.Models;

namespace SmartScheduler.Handlers;

public class UpdateContractorHandler : IRequestHandler<UpdateContractorCommand, UpdateContractorResponse>
{
    private readonly ApplicationDbContext _context;

    public UpdateContractorHandler(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<UpdateContractorResponse> Handle(UpdateContractorCommand request, CancellationToken cancellationToken)
    {
        var contractor = await _context.Contractors
            .Include(c => c.WorkingHours)
            .FirstOrDefaultAsync(c => c.Id == request.Id, cancellationToken);

        if (contractor == null)
        {
            throw new KeyNotFoundException($"Contractor with ID {request.Id} not found.");
        }

        // Optimistic concurrency check
        if (request.RowVersion != null && !contractor.RowVersion.SequenceEqual(request.RowVersion))
        {
            throw new DbUpdateConcurrencyException("Contractor has been modified by another user. Please refresh and try again.");
        }

        // Update fields (only if provided)
        if (request.Name != null)
        {
            contractor.Name = request.Name;
        }

        if (request.Type.HasValue)
        {
            contractor.Type = request.Type.Value;
        }

        if (request.PhoneNumber != null)
        {
            contractor.PhoneNumber = request.PhoneNumber;
        }

        if (request.Email != null)
        {
            contractor.Email = request.Email;
        }

        if (request.BaseLocation != null)
        {
            contractor.BaseLocation = request.BaseLocation;
        }

        if (request.Skills != null)
        {
            contractor.Skills = request.Skills;
        }

        if (request.Status.HasValue)
        {
            contractor.Status = request.Status.Value;
        }

        // Update working hours if provided
        if (request.WorkingHours != null)
        {
            // Remove existing working hours
            _context.ContractorWorkingHours.RemoveRange(contractor.WorkingHours);
            
            // Add new working hours
            contractor.WorkingHours = request.WorkingHours.Select(wh => new ContractorWorkingHours
            {
                ContractorId = contractor.Id,
                DayOfWeek = wh.DayOfWeek,
                StartTime = wh.StartTime,
                EndTime = wh.EndTime
            }).ToList();
        }

        // Update timestamp and row version
        var now = DateTime.UtcNow;
        contractor.UpdatedAt = now;
        contractor.RowVersion = BitConverter.GetBytes(now.Ticks);

        await _context.SaveChangesAsync(cancellationToken);

        // Reload to get updated RowVersion
        await _context.Entry(contractor).ReloadAsync(cancellationToken);

        return new UpdateContractorResponse
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
            WorkingHours = contractor.WorkingHours.Select(wh => new WorkingHours
            {
                DayOfWeek = wh.DayOfWeek,
                StartTime = wh.StartTime,
                EndTime = wh.EndTime
            }).ToList(),
            CreatedAt = contractor.CreatedAt,
            UpdatedAt = contractor.UpdatedAt,
            RowVersion = contractor.RowVersion
        };
    }
}

