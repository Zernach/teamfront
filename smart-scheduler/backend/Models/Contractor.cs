using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SmartScheduler.Models;

public class Contractor
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public ContractorType Type { get; set; }
    public decimal Rating { get; set; } = 0.00m;
    public ContractorStatus Status { get; set; } = ContractorStatus.Active;
    public string PhoneNumber { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    
    // Value object - owned entity
    public BaseLocation BaseLocation { get; set; } = new();
    
    // Skills stored as JSON array
    public List<string> Skills { get; set; } = new();
    
    // Working hours - separate table
    public List<ContractorWorkingHours> WorkingHours { get; set; } = new();
    
    // Audit columns
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    
    // Optimistic concurrency control
    [Timestamp]
    public byte[] RowVersion { get; set; } = Array.Empty<byte>();
}
