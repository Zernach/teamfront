using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using SmartScheduler.Data;
using SmartScheduler.DTOs;
using SmartScheduler.Handlers;
using SmartScheduler.Models;
using SmartScheduler.Queries;
using Xunit;

namespace SmartScheduler.Tests;

public class ContractorQueryHandlerTests : IDisposable
{
    private readonly ApplicationDbContext _context;
    private readonly GetContractorByIdHandler _getByIdHandler;
    private readonly ListContractorsHandler _listHandler;

    public ContractorQueryHandlerTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        
        _context = new ApplicationDbContext(options);
        _getByIdHandler = new GetContractorByIdHandler(_context);
        _listHandler = new ListContractorsHandler(_context);
    }

    [Fact]
    public async Task GetContractorById_WithValidId_ShouldReturnContractor()
    {
        // Arrange
        var contractor = new Contractor
        {
            Id = Guid.NewGuid(),
            Name = "Test Contractor",
            Type = ContractorType.Flooring,
            Rating = 4.5m,
            Status = ContractorStatus.Active,
            PhoneNumber = "555-1234",
            Email = "test@example.com",
            BaseLocation = new BaseLocation
            {
                Latitude = 40.7128m,
                Longitude = -74.0060m,
                Address = "123 Main St",
                City = "New York",
                State = "NY",
                ZipCode = "10001"
            },
            Skills = new List<string> { "Hardwood" },
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        _context.Contractors.Add(contractor);
        await _context.SaveChangesAsync();

        // Act
        var query = new GetContractorByIdQuery { Id = contractor.Id };
        var result = await _getByIdHandler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(contractor.Id);
        result.Name.Should().Be(contractor.Name);
        result.Type.Should().Be(contractor.Type);
        result.Rating.Should().Be(contractor.Rating);
        result.Email.Should().Be(contractor.Email);
        result.AvailabilityStatus.Should().Be("Available");
    }

    [Fact]
    public async Task GetContractorById_WithInvalidId_ShouldReturnNull()
    {
        // Arrange
        var query = new GetContractorByIdQuery { Id = Guid.NewGuid() };

        // Act
        var result = await _getByIdHandler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task ListContractors_WithNoFilters_ShouldReturnAllContractors()
    {
        // Arrange
        var contractors = new[]
        {
            new Contractor
            {
                Id = Guid.NewGuid(),
                Name = "Contractor A",
                Type = ContractorType.Flooring,
                Rating = 4.0m,
                Status = ContractorStatus.Active,
                PhoneNumber = "555-1111",
                Email = "a@example.com",
                BaseLocation = new BaseLocation { City = "NYC", State = "NY" },
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new Contractor
            {
                Id = Guid.NewGuid(),
                Name = "Contractor B",
                Type = ContractorType.Tile,
                Rating = 4.5m,
                Status = ContractorStatus.Active,
                PhoneNumber = "555-2222",
                Email = "b@example.com",
                BaseLocation = new BaseLocation { City = "LA", State = "CA" },
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            }
        };
        _context.Contractors.AddRange(contractors);
        await _context.SaveChangesAsync();

        // Act
        var query = new ListContractorsQuery { Page = 1, PageSize = 20 };
        var result = await _listHandler.Handle(query, CancellationToken.None);

        // Assert
        result.Items.Should().HaveCount(2);
        result.TotalCount.Should().Be(2);
        result.Page.Should().Be(1);
        result.PageSize.Should().Be(20);
    }

    [Fact]
    public async Task ListContractors_WithNameFilter_ShouldFilterByName()
    {
        // Arrange
        var contractors = new[]
        {
            new Contractor
            {
                Id = Guid.NewGuid(),
                Name = "John Doe",
                Type = ContractorType.Flooring,
                Rating = 4.0m,
                Status = ContractorStatus.Active,
                PhoneNumber = "555-1111",
                Email = "john@example.com",
                BaseLocation = new BaseLocation { City = "NYC", State = "NY" },
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new Contractor
            {
                Id = Guid.NewGuid(),
                Name = "Jane Smith",
                Type = ContractorType.Tile,
                Rating = 4.5m,
                Status = ContractorStatus.Active,
                PhoneNumber = "555-2222",
                Email = "jane@example.com",
                BaseLocation = new BaseLocation { City = "LA", State = "CA" },
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            }
        };
        _context.Contractors.AddRange(contractors);
        await _context.SaveChangesAsync();

        // Act
        var query = new ListContractorsQuery { Name = "John", Page = 1, PageSize = 20 };
        var result = await _listHandler.Handle(query, CancellationToken.None);

        // Assert
        result.Items.Should().HaveCount(1);
        result.Items[0].Name.Should().Be("John Doe");
    }

    [Fact]
    public async Task ListContractors_WithTypeFilter_ShouldFilterByType()
    {
        // Arrange
        var contractors = new[]
        {
            new Contractor
            {
                Id = Guid.NewGuid(),
                Name = "Flooring Contractor",
                Type = ContractorType.Flooring,
                Rating = 4.0m,
                Status = ContractorStatus.Active,
                PhoneNumber = "555-1111",
                Email = "flooring@example.com",
                BaseLocation = new BaseLocation { City = "NYC", State = "NY" },
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new Contractor
            {
                Id = Guid.NewGuid(),
                Name = "Tile Contractor",
                Type = ContractorType.Tile,
                Rating = 4.5m,
                Status = ContractorStatus.Active,
                PhoneNumber = "555-2222",
                Email = "tile@example.com",
                BaseLocation = new BaseLocation { City = "LA", State = "CA" },
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            }
        };
        _context.Contractors.AddRange(contractors);
        await _context.SaveChangesAsync();

        // Act
        var query = new ListContractorsQuery { Type = ContractorType.Flooring, Page = 1, PageSize = 20 };
        var result = await _listHandler.Handle(query, CancellationToken.None);

        // Assert
        result.Items.Should().HaveCount(1);
        result.Items[0].Type.Should().Be(ContractorType.Flooring);
    }

    [Fact]
    public async Task ListContractors_WithPagination_ShouldReturnCorrectPage()
    {
        // Arrange
        var contractors = Enumerable.Range(1, 25).Select(i => new Contractor
        {
            Id = Guid.NewGuid(),
            Name = $"Contractor {i}",
            Type = ContractorType.Flooring,
            Rating = 4.0m,
            Status = ContractorStatus.Active,
            PhoneNumber = $"555-{i:D4}",
            Email = $"contractor{i}@example.com",
            BaseLocation = new BaseLocation { City = "NYC", State = "NY" },
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        }).ToList();
        _context.Contractors.AddRange(contractors);
        await _context.SaveChangesAsync();

        // Act
        var query = new ListContractorsQuery { Page = 2, PageSize = 10 };
        var result = await _listHandler.Handle(query, CancellationToken.None);

        // Assert
        result.Items.Should().HaveCount(10);
        result.TotalCount.Should().Be(25);
        result.Page.Should().Be(2);
        result.TotalPages.Should().Be(3);
    }

    public void Dispose()
    {
        _context.Dispose();
    }
}

