using MediatR;
using Microsoft.EntityFrameworkCore;
using SmartScheduler.Commands;
using SmartScheduler.Data;
using SmartScheduler.DTOs;
using SmartScheduler.Models;

namespace SmartScheduler.Handlers;

public class CreateJobHandler : IRequestHandler<CreateJobCommand, CreateJobResponse>
{
    private readonly ApplicationDbContext _context;

    public CreateJobHandler(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<CreateJobResponse> Handle(CreateJobCommand request, CancellationToken cancellationToken)
    {
        // Use first type from Types array if provided, otherwise use Type field
        var primaryType = request.Types != null && request.Types.Count > 0 
            ? request.Types[0] 
            : request.Type;

        var specialRequirements = new List<string>(request.SpecialRequirements);
        
        // Add additional types to special requirements if multiple types selected
        if (request.Types != null && request.Types.Count > 1)
        {
            var additionalTypes = request.Types.Skip(1)
                .Select(t => t.ToString())
                .ToList();
            specialRequirements.AddRange(additionalTypes);
        }
        
        // Add "Other" type text if provided
        if (!string.IsNullOrWhiteSpace(request.OtherTypeText))
        {
            specialRequirements.Add($"Other Type: {request.OtherTypeText}");
        }

        var job = new Job
        {
            Id = Guid.NewGuid(),
            JobNumber = Job.GenerateJobNumber(),
            Type = primaryType,
            Status = JobStatus.Open,
            DesiredDate = request.DesiredDate,
            Duration = request.Duration,
            Priority = request.Priority,
            Location = request.Location,
            SpecialRequirements = specialRequirements,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Jobs.Add(job);
        await _context.SaveChangesAsync(cancellationToken);

        return new CreateJobResponse
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
            CreatedAt = job.CreatedAt
        };
    }
}

