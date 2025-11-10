using Microsoft.EntityFrameworkCore;
using SmartScheduler.Data;
using SmartScheduler.Models;

namespace SmartScheduler.Services;

public interface IAvailabilityService
{
    Task<List<TimeSlot>> GetAvailableTimeSlotsAsync(
        Guid contractorId,
        DateTime date,
        TimeSpan duration,
        CancellationToken cancellationToken = default);

    Task<bool> IsAvailableAsync(
        Guid contractorId,
        DateTime startTime,
        DateTime endTime,
        CancellationToken cancellationToken = default);
}

public class TimeSlot
{
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public TimeSpan Duration => EndTime - StartTime;
}

public class AvailabilityService : IAvailabilityService
{
    private readonly ApplicationDbContext _context;

    public AvailabilityService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<TimeSlot>> GetAvailableTimeSlotsAsync(
        Guid contractorId,
        DateTime date,
        TimeSpan duration,
        CancellationToken cancellationToken = default)
    {
        var contractor = await _context.Contractors
            .Include(c => c.WorkingHours)
            .FirstOrDefaultAsync(c => c.Id == contractorId, cancellationToken);

        if (contractor == null || contractor.Status != ContractorStatus.Active)
            return new List<TimeSlot>();

        var dayOfWeek = (int)date.DayOfWeek;
        var workingHours = contractor.WorkingHours
            .FirstOrDefault(wh => wh.DayOfWeek == dayOfWeek);

        if (workingHours == null)
            return new List<TimeSlot>();

        // Get existing assignments for the day
        var existingAssignments = await _context.Assignments
            .Where(a => a.ContractorId == contractorId &&
                       a.ScheduledStartTime.Date == date.Date &&
                       a.Status != AssignmentStatus.Cancelled)
            .ToListAsync(cancellationToken);

        var bookedSlots = existingAssignments
            .Select(a => new { a.ScheduledStartTime, a.ScheduledEndTime })
            .ToList();

        // Calculate available slots
        var slots = new List<TimeSlot>();
        var currentTime = date.Date + workingHours.StartTime.ToTimeSpan();
        var endOfDay = date.Date + workingHours.EndTime.ToTimeSpan();

        while (currentTime + duration <= endOfDay)
        {
            var slotEnd = currentTime + duration;
            var slot = new TimeSlot { StartTime = currentTime, EndTime = slotEnd };

            // Check if slot overlaps with any booked slot
            var hasOverlap = bookedSlots.Any(booked =>
                (slot.StartTime < booked.ScheduledEndTime && slot.EndTime > booked.ScheduledStartTime));

            if (!hasOverlap)
            {
                slots.Add(slot);
            }

            // Move to next 30-minute slot
            currentTime = currentTime.AddMinutes(30);
        }

        return slots;
    }

    public async Task<bool> IsAvailableAsync(
        Guid contractorId,
        DateTime startTime,
        DateTime endTime,
        CancellationToken cancellationToken = default)
    {
        var availableSlots = await GetAvailableTimeSlotsAsync(
            contractorId,
            startTime.Date,
            endTime - startTime,
            cancellationToken);

        return availableSlots.Any(slot =>
            slot.StartTime <= startTime && slot.EndTime >= endTime);
    }
}

