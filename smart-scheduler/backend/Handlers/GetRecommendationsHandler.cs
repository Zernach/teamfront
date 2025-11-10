using MediatR;
using Microsoft.EntityFrameworkCore;
using SmartScheduler.Data;
using SmartScheduler.Models;
using SmartScheduler.Queries;
using SmartScheduler.Services;
using SmartScheduler.DTOs;

namespace SmartScheduler.Handlers;

public class GetRecommendationsHandler : IRequestHandler<GetRecommendationsQuery, RecommendationResponse>
{
    private readonly ApplicationDbContext _context;
    private readonly IAvailabilityService _availabilityService;
    private readonly IDistanceService _distanceService;
    private readonly IScoringService _scoringService;

    public GetRecommendationsHandler(
        ApplicationDbContext context,
        IAvailabilityService availabilityService,
        IDistanceService distanceService,
        IScoringService scoringService)
    {
        _context = context;
        _availabilityService = availabilityService;
        _distanceService = distanceService;
        _scoringService = scoringService;
    }

    public async Task<RecommendationResponse> Handle(GetRecommendationsQuery request, CancellationToken cancellationToken)
    {
        var job = await _context.Jobs
            .FirstOrDefaultAsync(j => j.Id == request.JobId, cancellationToken);

        if (job == null)
            throw new KeyNotFoundException($"Job {request.JobId} not found");

        if (job.Status != JobStatus.Open)
            throw new InvalidOperationException("Only open jobs can have recommendations");

        // Get eligible contractors (matching job type, active status)
        var contractorType = MapJobTypeToContractorType(job.Type);
        var eligibleContractors = await _context.Contractors
            .Include(c => c.WorkingHours)
            .Where(c => (c.Type == contractorType || c.Type == ContractorType.Multi) &&
                       c.Status == ContractorStatus.Active)
            .ToListAsync(cancellationToken);

        var rankedContractors = new List<RankedContractorDto>();

        foreach (var contractor in eligibleContractors)
        {
            // Check availability
            var availableSlots = await _availabilityService.GetAvailableTimeSlotsAsync(
                contractor.Id,
                job.DesiredDate.Date,
                job.Duration,
                cancellationToken);

            if (!availableSlots.Any())
                continue; // Skip contractors with no availability

            var earliestSlot = availableSlots.First();

            // Calculate distance
            var distance = await _distanceService.CalculateDistanceAsync(
                contractor.BaseLocation,
                job.Location,
                cancellationToken);

            // Calculate score
            var scoringResult = _scoringService.CalculateScore(
                contractor,
                job,
                earliestSlot.StartTime,
                distance);

            var travelTime = await _distanceService.CalculateTravelTimeAsync(
                contractor.BaseLocation,
                job.Location,
                cancellationToken);

            rankedContractors.Add(new RankedContractorDto
            {
                Contractor = new ContractorListItemDto
                {
                    Id = contractor.Id,
                    Name = contractor.Name,
                    Type = contractor.Type,
                    Rating = contractor.Rating,
                    Status = contractor.Status,
                    PhoneNumber = contractor.PhoneNumber,
                    Email = contractor.Email,
                    City = contractor.BaseLocation.City,
                    State = contractor.BaseLocation.State
                },
                Score = scoringResult.TotalScore,
                ScoreBreakdown = new ScoringDetailsDto
                {
                    AvailabilityScore = scoringResult.AvailabilityScore,
                    RatingScore = scoringResult.RatingScore,
                    DistanceScore = scoringResult.DistanceScore,
                    AvailabilityWeight = scoringResult.AvailabilityWeight,
                    RatingWeight = scoringResult.RatingWeight,
                    DistanceWeight = scoringResult.DistanceWeight,
                    Explanation = scoringResult.Explanation
                },
                AvailableTimeSlots = availableSlots.Select(s => new TimeSlotDto
                {
                    StartTime = s.StartTime,
                    EndTime = s.EndTime,
                    Duration = s.Duration
                }).ToList(),
                DistanceFromJob = distance,
                EstimatedTravelTime = travelTime
            });
        }

        // Sort by score (descending) and take top N
        var topContractors = rankedContractors
            .OrderByDescending(c => c.Score)
            .Take(request.MaxResults)
            .Select((c, index) => { c.Rank = index + 1; return c; })
            .ToList();

        return new RecommendationResponse
        {
            JobId = job.Id,
            JobDetails = new JobDetailsDto
            {
                JobNumber = job.JobNumber,
                Type = job.Type,
                Location = job.Location,
                DesiredDate = job.DesiredDate,
                Duration = job.Duration
            },
            Recommendations = topContractors,
            GeneratedAt = DateTime.UtcNow
        };
    }

    private ContractorType MapJobTypeToContractorType(JobType jobType)
    {
        return jobType switch
        {
            JobType.Flooring => ContractorType.Flooring,
            JobType.Tile => ContractorType.Tile,
            JobType.Carpet => ContractorType.Carpet,
            // All other flooring types map to Flooring contractor type
            JobType.Hardwood => ContractorType.Flooring,
            JobType.Laminate => ContractorType.Flooring,
            JobType.Vinyl => ContractorType.Flooring,
            JobType.Linoleum => ContractorType.Flooring,
            JobType.Bamboo => ContractorType.Flooring,
            JobType.Cork => ContractorType.Flooring,
            JobType.Concrete => ContractorType.Flooring,
            JobType.Marble => ContractorType.Flooring,
            JobType.Granite => ContractorType.Flooring,
            JobType.Stone => ContractorType.Flooring,
            JobType.Other => ContractorType.Flooring,
            _ => ContractorType.Flooring // Default fallback
        };
    }
}

