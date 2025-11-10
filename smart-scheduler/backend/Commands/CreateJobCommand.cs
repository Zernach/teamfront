using MediatR;
using SmartScheduler.DTOs;
using SmartScheduler.Models;

namespace SmartScheduler.Commands;

public class CreateJobCommand : IRequest<CreateJobResponse>
{
    public JobType Type { get; set; }
    public List<JobType>? Types { get; set; } // For multi-select support
    public string? OtherTypeText { get; set; } // For "Other" option text
    public DateTime DesiredDate { get; set; }
    public BaseLocation Location { get; set; } = new();
    public TimeSpan Duration { get; set; }
    public Priority Priority { get; set; } = Priority.Medium;
    public List<string> SpecialRequirements { get; set; } = new();
}

public class CreateJobResponse
{
    public Guid Id { get; set; }
    public string JobNumber { get; set; } = string.Empty;
    public JobType Type { get; set; }
    public JobStatus Status { get; set; }
    public DateTime DesiredDate { get; set; }
    public BaseLocation Location { get; set; } = new();
    public TimeSpan Duration { get; set; }
    public Priority Priority { get; set; }
    public List<string> SpecialRequirements { get; set; } = new();
    public DateTime CreatedAt { get; set; }
}

