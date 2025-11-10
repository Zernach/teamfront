using System.ComponentModel.DataAnnotations;

namespace SmartScheduler.Models;

public class Job
{
    public Guid Id { get; set; }
    public string JobNumber { get; set; } = string.Empty;
    public JobType Type { get; set; }
    public JobStatus Status { get; set; } = JobStatus.Open;
    public DateTime DesiredDate { get; set; }
    public TimeSpan Duration { get; set; }
    public Priority Priority { get; set; } = Priority.Medium;
    
    // Value object - owned entity
    public BaseLocation Location { get; set; } = new();
    
    // Special requirements stored as JSON array
    public List<string> SpecialRequirements { get; set; } = new();
    
    // Assignment reference
    public Guid? AssignedContractorId { get; set; }
    public Contractor? AssignedContractor { get; set; }
    
    // Audit columns
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    
    // Optimistic concurrency control
    [Timestamp]
    public byte[] RowVersion { get; set; } = Array.Empty<byte>();
    
    // Navigation property
    public Assignment? Assignment { get; set; }
    
    public static string GenerateJobNumber()
    {
        return $"JOB-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString().Substring(0, 8).ToUpper()}";
    }
}

