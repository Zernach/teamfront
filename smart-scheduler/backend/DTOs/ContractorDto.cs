using SmartScheduler.Models;

namespace SmartScheduler.DTOs;

public class ContractorDetailDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public ContractorType Type { get; set; }
    public decimal Rating { get; set; }
    public ContractorStatus Status { get; set; }
    public string PhoneNumber { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public BaseLocation BaseLocation { get; set; } = new();
    public List<string> Skills { get; set; } = new();
    public List<WorkingHoursDto> WorkingHours { get; set; } = new();
    public string AvailabilityStatus { get; set; } = "Unknown";
    public ContractorStatisticsDto Statistics { get; set; } = new();
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class ContractorListItemDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public ContractorType Type { get; set; }
    public decimal Rating { get; set; }
    public ContractorStatus Status { get; set; }
    public string PhoneNumber { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public string AvailabilityStatus { get; set; } = "Unknown";
}

public class WorkingHoursDto
{
    public int DayOfWeek { get; set; }
    public TimeOnly StartTime { get; set; }
    public TimeOnly EndTime { get; set; }
}

public class ContractorStatisticsDto
{
    public int TotalJobs { get; set; }
    public int CompletedJobs { get; set; }
    public int PendingJobs { get; set; }
    public decimal AverageRating { get; set; }
}
