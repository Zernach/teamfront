using MediatR;
using Microsoft.EntityFrameworkCore;
using SmartScheduler.Commands;
using SmartScheduler.Data;
using SmartScheduler.DTOs;
using SmartScheduler.Models;
using SmartScheduler.Services;

namespace SmartScheduler.Handlers;

public class CreateAssignmentHandler : IRequestHandler<CreateAssignmentCommand, CreateAssignmentResponse>
{
    private readonly ApplicationDbContext _context;
    private readonly IAvailabilityService _availabilityService;
    private readonly IDistanceService _distanceService;
    private readonly IScoringService _scoringService;

    public CreateAssignmentHandler(
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

    public async Task<CreateAssignmentResponse> Handle(CreateAssignmentCommand request, CancellationToken cancellationToken)
    {
        var job = await _context.Jobs
            .Include(j => j.AssignedContractor)
            .FirstOrDefaultAsync(j => j.Id == request.JobId, cancellationToken);

        if (job == null)
            throw new KeyNotFoundException($"Job {request.JobId} not found");

        if (job.Status != JobStatus.Open)
            throw new InvalidOperationException("Only open jobs can be assigned");

        var contractor = await _context.Contractors
            .FirstOrDefaultAsync(c => c.Id == request.ContractorId, cancellationToken);

        if (contractor == null)
            throw new KeyNotFoundException($"Contractor {request.ContractorId} not found");

        // Check availability
        var isAvailable = await _availabilityService.IsAvailableAsync(
            request.ContractorId,
            request.ScheduledStartTime,
            request.ScheduledEndTime,
            cancellationToken);

        if (!isAvailable)
            throw new InvalidOperationException("Contractor is not available at the requested time");

        // Calculate distance and score
        var distance = await _distanceService.CalculateDistanceAsync(
            contractor.BaseLocation,
            job.Location,
            cancellationToken);

        var scoringResult = _scoringService.CalculateScore(
            contractor,
            job,
            request.ScheduledStartTime,
            distance);

        // Create assignment
        var assignment = new Assignment
        {
            Id = Guid.NewGuid(),
            JobId = job.Id,
            ContractorId = contractor.Id,
            Status = AssignmentStatus.Pending,
            Score = scoringResult.TotalScore,
            ScheduledStartTime = request.ScheduledStartTime,
            ScheduledEndTime = request.ScheduledEndTime,
            ScheduledDuration = request.ScheduledEndTime - request.ScheduledStartTime,
            ScoreAvailabilityScore = scoringResult.AvailabilityScore,
            ScoreRatingScore = scoringResult.RatingScore,
            ScoreDistanceScore = scoringResult.DistanceScore,
            ScoreAvailabilityWeight = scoringResult.AvailabilityWeight,
            ScoreRatingWeight = scoringResult.RatingWeight,
            ScoreDistanceWeight = scoringResult.DistanceWeight,
            ScoreExplanation = scoringResult.Explanation,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        // Update job status
        job.Status = JobStatus.Assigned;
        job.AssignedContractorId = contractor.Id;
        job.UpdatedAt = DateTime.UtcNow;

        _context.Assignments.Add(assignment);
        await _context.SaveChangesAsync(cancellationToken);

        return new CreateAssignmentResponse
        {
            Id = assignment.Id,
            JobId = assignment.JobId,
            ContractorId = assignment.ContractorId,
            Status = assignment.Status,
            Score = assignment.Score,
            ScoreBreakdown = new ScoringDetailsDto
            {
                AvailabilityScore = assignment.ScoreAvailabilityScore,
                RatingScore = assignment.ScoreRatingScore,
                DistanceScore = assignment.ScoreDistanceScore,
                AvailabilityWeight = assignment.ScoreAvailabilityWeight,
                RatingWeight = assignment.ScoreRatingWeight,
                DistanceWeight = assignment.ScoreDistanceWeight,
                Explanation = assignment.ScoreExplanation
            },
            ScheduledStartTime = assignment.ScheduledStartTime,
            ScheduledEndTime = assignment.ScheduledEndTime,
            CreatedAt = assignment.CreatedAt
        };
    }
}

