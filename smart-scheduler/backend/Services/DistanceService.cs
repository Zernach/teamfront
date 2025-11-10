using SmartScheduler.Models;

namespace SmartScheduler.Services;

public interface IDistanceService
{
    Task<decimal> CalculateDistanceAsync(
        BaseLocation from,
        BaseLocation to,
        CancellationToken cancellationToken = default);

    Task<int> CalculateTravelTimeAsync(
        BaseLocation from,
        BaseLocation to,
        CancellationToken cancellationToken = default);
}

public class DistanceService : IDistanceService
{
    public Task<decimal> CalculateDistanceAsync(
        BaseLocation from,
        BaseLocation to,
        CancellationToken cancellationToken = default)
    {
        // Haversine formula for distance calculation
        const double EarthRadiusMiles = 3959;

        var lat1 = (double)from.Latitude * Math.PI / 180;
        var lat2 = (double)to.Latitude * Math.PI / 180;
        var deltaLat = lat2 - lat1;
        var deltaLon = (double)(to.Longitude - from.Longitude) * Math.PI / 180;

        var a = Math.Sin(deltaLat / 2) * Math.Sin(deltaLat / 2) +
                Math.Cos(lat1) * Math.Cos(lat2) *
                Math.Sin(deltaLon / 2) * Math.Sin(deltaLon / 2);

        var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));

        var distance = (decimal)(EarthRadiusMiles * c);
        return Task.FromResult(distance);
    }

    public Task<int> CalculateTravelTimeAsync(
        BaseLocation from,
        BaseLocation to,
        CancellationToken cancellationToken = default)
    {
        // Simple estimation: average speed 30 mph
        var distanceTask = CalculateDistanceAsync(from, to, cancellationToken);
        var distance = distanceTask.Result;
        var travelTimeMinutes = (int)(distance / 30m * 60m);
        
        // Minimum 5 minutes, maximum 120 minutes
        travelTimeMinutes = Math.Max(5, Math.Min(120, travelTimeMinutes));
        
        return Task.FromResult(travelTimeMinutes);
    }
}

