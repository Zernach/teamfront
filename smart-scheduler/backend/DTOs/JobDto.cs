using SmartScheduler.Models;

namespace SmartScheduler.DTOs;

public class JobDetailDto
{
    public Guid Id { get; set; }
    public string JobNumber { get; set; } = string.Empty;
    public JobType Type { get; set; }
    public JobStatus Status { get; set; }
    public DateTime DesiredDate { get; set; }
    public TimeSpan Duration { get; set; }
    public Priority Priority { get; set; }
    public BaseLocation Location { get; set; } = new();
    public List<string> SpecialRequirements { get; set; } = new();
    public Guid? AssignedContractorId { get; set; }
    public string? AssignedContractorName { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class JobListItemDto
{
    public Guid Id { get; set; }
    public string JobNumber { get; set; } = string.Empty;
    public JobType Type { get; set; }
    public JobStatus Status { get; set; }
    public DateTime DesiredDate { get; set; }
    public TimeSpan Duration { get; set; }
    public Priority Priority { get; set; }
    public string Address { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public Guid? AssignedContractorId { get; set; }
    public string? AssignedContractorName { get; set; }
}

public class PagedResult<T>
{
    public List<T> Data { get; set; } = new();
    public int CurrentPage { get; set; }
    public int PageSize { get; set; }
    public int TotalPages { get; set; }
    public int TotalCount { get; set; }
}

public class ScoringDetailsDto
{
    public decimal AvailabilityScore { get; set; }
    public decimal RatingScore { get; set; }
    public decimal DistanceScore { get; set; }
    public decimal AvailabilityWeight { get; set; }
    public decimal RatingWeight { get; set; }
    public decimal DistanceWeight { get; set; }
    public string? Explanation { get; set; }
}

public class TimeSlotDto
{
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public TimeSpan Duration { get; set; }
}


