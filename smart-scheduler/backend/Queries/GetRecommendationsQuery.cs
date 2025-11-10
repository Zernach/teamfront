using MediatR;
using SmartScheduler.DTOs;
using SmartScheduler.Models;

namespace SmartScheduler.Queries;

public class GetRecommendationsQuery : IRequest<RecommendationResponse>
{
    public Guid JobId { get; set; }
    public int MaxResults { get; set; } = 10;
}

public class RecommendationResponse
{
    public Guid JobId { get; set; }
    public JobDetailsDto JobDetails { get; set; } = new();
    public List<RankedContractorDto> Recommendations { get; set; } = new();
    public DateTime GeneratedAt { get; set; }
}

public class JobDetailsDto
{
    public string JobNumber { get; set; } = string.Empty;
    public JobType Type { get; set; }
    public BaseLocation Location { get; set; } = new();
    public DateTime DesiredDate { get; set; }
    public TimeSpan Duration { get; set; }
}

public class RankedContractorDto
{
    public int Rank { get; set; }
    public ContractorListItemDto Contractor { get; set; } = new();
    public decimal Score { get; set; }
    public ScoringDetailsDto ScoreBreakdown { get; set; } = new();
    public List<TimeSlotDto> AvailableTimeSlots { get; set; } = new();
    public decimal DistanceFromJob { get; set; }
    public int EstimatedTravelTime { get; set; }
}

