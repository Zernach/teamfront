using System.ComponentModel.DataAnnotations;

namespace SmartScheduler.Models;

public class Assignment
{
    public Guid Id { get; set; }
    public Guid JobId { get; set; }
    public Guid ContractorId { get; set; }
    public AssignmentStatus Status { get; set; } = AssignmentStatus.Pending;
    public decimal Score { get; set; }
    
    // Scheduled Time Slot
    public DateTime ScheduledStartTime { get; set; }
    public DateTime ScheduledEndTime { get; set; }
    public TimeSpan ScheduledDuration { get; set; }
    
    // Score Breakdown (Value Object - Owned Entity)
    public decimal ScoreAvailabilityScore { get; set; }
    public decimal ScoreRatingScore { get; set; }
    public decimal ScoreDistanceScore { get; set; }
    public decimal ScoreAvailabilityWeight { get; set; }
    public decimal ScoreRatingWeight { get; set; }
    public decimal ScoreDistanceWeight { get; set; }
    public string? ScoreExplanation { get; set; }
    
    // Status timestamps
    public DateTime? ConfirmedAt { get; set; }
    public DateTime? StartedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public string? CancellationReason { get; set; }
    
    // Audit columns
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    
    // Navigation properties
    public Job Job { get; set; } = null!;
    public Contractor Contractor { get; set; } = null!;
}

