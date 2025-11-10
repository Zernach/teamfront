using SmartScheduler.Models;

namespace SmartScheduler.Services;

public interface IScoringService
{
    ScoringResult CalculateScore(
        Contractor contractor,
        Job job,
        DateTime earliestAvailability,
        decimal distanceInMiles);
}

public class ScoringResult
{
    public decimal TotalScore { get; set; }
    public decimal AvailabilityScore { get; set; }
    public decimal RatingScore { get; set; }
    public decimal DistanceScore { get; set; }
    public decimal AvailabilityWeight { get; set; } = 0.40m;
    public decimal RatingWeight { get; set; } = 0.35m;
    public decimal DistanceWeight { get; set; } = 0.25m;
    public string? Explanation { get; set; }
}

public class ScoringService : IScoringService
{
    private const decimal MaxDistanceMiles = 50.0m;

    public ScoringResult CalculateScore(
        Contractor contractor,
        Job job,
        DateTime earliestAvailability,
        decimal distanceInMiles)
    {
        // Calculate availability score
        var daysDifference = (earliestAvailability.Date - job.DesiredDate.Date).Days;
        var availabilityScore = CalculateAvailabilityScore(daysDifference);

        // Calculate rating score
        var ratingScore = CalculateRatingScore(contractor.Rating);

        // Calculate distance score
        var distanceScore = CalculateDistanceScore(distanceInMiles);

        var result = new ScoringResult
        {
            AvailabilityScore = availabilityScore,
            RatingScore = ratingScore,
            DistanceScore = distanceScore,
            AvailabilityWeight = 0.40m,
            RatingWeight = 0.35m,
            DistanceWeight = 0.25m
        };

        result.TotalScore = (result.AvailabilityWeight * result.AvailabilityScore) +
                           (result.RatingWeight * result.RatingScore) +
                           (result.DistanceWeight * result.DistanceScore);

        result.Explanation = GenerateExplanation(contractor, availabilityScore, ratingScore, distanceScore, daysDifference, distanceInMiles);

        return result;
    }

    private decimal CalculateAvailabilityScore(int daysDifference)
    {
        // Perfect score for same day, decreasing by 0.1 per day
        // Minimum score of 0.0 after 10+ days
        if (daysDifference <= 0)
            return 1.0m;

        var score = 1.0m - (daysDifference * 0.1m);
        return Math.Max(0.0m, score);
    }

    private decimal CalculateRatingScore(decimal rating)
    {
        // Normalize rating from 0-5 scale to 0-1 scale
        return rating / 5.0m;
    }

    private decimal CalculateDistanceScore(decimal distanceInMiles)
    {
        // Linear decay from 1.0 at 0 miles to 0.0 at maxDistance miles
        if (distanceInMiles <= 0)
            return 1.0m;

        if (distanceInMiles >= MaxDistanceMiles)
            return 0.0m;

        return 1.0m - (distanceInMiles / MaxDistanceMiles);
    }

    private string GenerateExplanation(
        Contractor contractor,
        decimal availabilityScore,
        decimal ratingScore,
        decimal distanceScore,
        int daysDifference,
        decimal distanceInMiles)
    {
        var parts = new List<string>();

        if (daysDifference == 0)
            parts.Add("same-day availability");
        else if (daysDifference == 1)
            parts.Add("next-day availability");
        else
            parts.Add($"available in {daysDifference} days");

        parts.Add($"{contractor.Rating:F1} rating");
        parts.Add($"{distanceInMiles:F1} miles away");

        return $"Contractor {contractor.Name} scored highest due to {string.Join(", ", parts)}.";
    }
}

