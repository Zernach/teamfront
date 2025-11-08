using MediatR;

namespace SmartScheduler.Commands;

public class DeactivateContractorCommand : IRequest<DeactivateContractorResponse>
{
    public Guid Id { get; set; }
}

public class DeactivateContractorResponse
{
    public Guid Id { get; set; }
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
}

public class RestoreContractorCommand : IRequest<RestoreContractorResponse>
{
    public Guid Id { get; set; }
}

public class RestoreContractorResponse
{
    public Guid Id { get; set; }
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
}

