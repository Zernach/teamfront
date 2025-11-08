namespace SmartScheduler.Models;

public class WorkingHours
{
    public int DayOfWeek { get; set; } // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    public TimeOnly StartTime { get; set; }
    public TimeOnly EndTime { get; set; }
}

