namespace SmartScheduler.Models;

public class ContractorWorkingHours
{
    public int Id { get; set; }
    public Guid ContractorId { get; set; }
    public Contractor Contractor { get; set; } = null!;
    public int DayOfWeek { get; set; } // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    public TimeOnly StartTime { get; set; }
    public TimeOnly EndTime { get; set; }
}

