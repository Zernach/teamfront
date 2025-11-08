using MediatR;
using Microsoft.EntityFrameworkCore;
using SmartScheduler.Commands;
using SmartScheduler.Data;
using SmartScheduler.Models;

namespace SmartScheduler.Handlers;

public class DeactivateContractorHandler : IRequestHandler<DeactivateContractorCommand, DeactivateContractorResponse>
{
    private readonly ApplicationDbContext _context;

    public DeactivateContractorHandler(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<DeactivateContractorResponse> Handle(DeactivateContractorCommand request, CancellationToken cancellationToken)
    {
        var contractor = await _context.Contractors
            .FirstOrDefaultAsync(c => c.Id == request.Id, cancellationToken);

        if (contractor == null)
        {
            throw new KeyNotFoundException($"Contractor with ID {request.Id} not found.");
        }

        // Check for active assignments (placeholder - will be implemented when Assignments table exists)
        // var hasActiveAssignments = await _context.Assignments
        //     .AnyAsync(a => a.ContractorId == request.Id && a.Status != AssignmentStatus.Cancelled, cancellationToken);
        // if (hasActiveAssignments)
        // {
        //     throw new InvalidOperationException("Cannot deactivate contractor with active assignments.");
        // }

        // Soft delete: set status to Inactive
        contractor.Status = ContractorStatus.Inactive;
        contractor.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        return new DeactivateContractorResponse
        {
            Id = contractor.Id,
            Success = true,
            Message = "Contractor deactivated successfully."
        };
    }
}

public class RestoreContractorHandler : IRequestHandler<RestoreContractorCommand, RestoreContractorResponse>
{
    private readonly ApplicationDbContext _context;

    public RestoreContractorHandler(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<RestoreContractorResponse> Handle(RestoreContractorCommand request, CancellationToken cancellationToken)
    {
        var contractor = await _context.Contractors
            .FirstOrDefaultAsync(c => c.Id == request.Id, cancellationToken);

        if (contractor == null)
        {
            throw new KeyNotFoundException($"Contractor with ID {request.Id} not found.");
        }

        // Restore: set status back to Active
        contractor.Status = ContractorStatus.Active;
        contractor.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        return new RestoreContractorResponse
        {
            Id = contractor.Id,
            Success = true,
            Message = "Contractor restored successfully."
        };
    }
}

