using MediatR;
using SmartScheduler.Models;

namespace SmartScheduler.Commands;

public class CreateContractorCommand : IRequest<CreateContractorResponse>
{
    public string Name { get; set; } = string.Empty;
    public ContractorType Type { get; set; }
    public string PhoneNumber { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public BaseLocation BaseLocation { get; set; } = new();
    public List<string>? Skills { get; set; }
    public List<WorkingHours>? WorkingHours { get; set; }
}

public class CreateContractorResponse
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
    public List<WorkingHours> WorkingHours { get; set; } = new();
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

