using MediatR;
using SmartScheduler.DTOs;
using SmartScheduler.Models;

namespace SmartScheduler.Commands;

public class CreateAssignmentCommand : IRequest<CreateAssignmentResponse>
{
    public Guid JobId { get; set; }
    public Guid ContractorId { get; set; }
    public DateTime ScheduledStartTime { get; set; }
    public DateTime ScheduledEndTime { get; set; }
}

public class CreateAssignmentResponse
{
    public Guid Id { get; set; }
    public Guid JobId { get; set; }
    public Guid ContractorId { get; set; }
    public AssignmentStatus Status { get; set; }
    public decimal Score { get; set; }
    public ScoringDetailsDto ScoreBreakdown { get; set; } = new();
    public DateTime ScheduledStartTime { get; set; }
    public DateTime ScheduledEndTime { get; set; }
    public DateTime CreatedAt { get; set; }
}

