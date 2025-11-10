using MediatR;
using SmartScheduler.DTOs;
using SmartScheduler.Models;

namespace SmartScheduler.Queries;

public class GetContractorByIdQuery : IRequest<ContractorDetailDto?>
{
    public Guid Id { get; set; }
}

public class ListContractorsQuery : IRequest<PagedResult<ContractorListItemDto>>
{
    public string? Name { get; set; }
    public ContractorType? Type { get; set; }
    public decimal? MinRating { get; set; }
    public decimal? MaxRating { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public bool IncludeInactive { get; set; } = false; // Admin option to include inactive contractors
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}

