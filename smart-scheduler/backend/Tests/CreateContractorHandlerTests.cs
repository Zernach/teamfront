using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using SmartScheduler.Commands;
using SmartScheduler.Data;
using SmartScheduler.Handlers;
using SmartScheduler.Models;
using Xunit;

namespace SmartScheduler.Tests;

public class CreateContractorHandlerTests : IDisposable
{
    private readonly ApplicationDbContext _context;
    private readonly CreateContractorHandler _handler;

    public CreateContractorHandlerTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        
        _context = new ApplicationDbContext(options);
        _context.Database.EnsureCreated();
        _handler = new CreateContractorHandler(_context);
    }

    [Fact]
    public async Task Handle_WithValidData_ShouldCreateContractor()
    {
        // Arrange
        var command = new CreateContractorCommand
        {
            Name = "John Doe",
            Type = ContractorType.Flooring,
            PhoneNumber = "555-1234",
            Email = "john@example.com",
            BaseLocation = new BaseLocation
            {
                Latitude = 40.7128m,
                Longitude = -74.0060m,
                Address = "123 Main St",
                City = "New York",
                State = "NY",
                ZipCode = "10001"
            },
            Skills = new List<string> { "Hardwood", "Laminate" }
        };

        // Act
        var response = await _handler.Handle(command, CancellationToken.None);

        // Assert
        response.Should().NotBeNull();
        response.Id.Should().NotBeEmpty();
        response.Name.Should().Be(command.Name);
        response.Type.Should().Be(command.Type);
        response.Email.Should().Be(command.Email);
        response.PhoneNumber.Should().Be(command.PhoneNumber);
        response.Rating.Should().Be(0.00m);
        response.Status.Should().Be(ContractorStatus.Active);
        response.Skills.Should().BeEquivalentTo(command.Skills);
        response.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
        response.UpdatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));

        // Verify in database
        var contractor = await _context.Contractors.FindAsync(response.Id);
        contractor.Should().NotBeNull();
        contractor!.Name.Should().Be(command.Name);
    }

    [Fact]
    public async Task Handle_WithoutWorkingHours_ShouldSetDefaultWorkingHours()
    {
        // Arrange
        var command = new CreateContractorCommand
        {
            Name = "Jane Smith",
            Type = ContractorType.Tile,
            PhoneNumber = "555-5678",
            Email = "jane@example.com",
            BaseLocation = new BaseLocation
            {
                Latitude = 34.0522m,
                Longitude = -118.2437m,
                Address = "456 Oak Ave",
                City = "Los Angeles",
                State = "CA",
                ZipCode = "90001"
            }
        };

        // Act
        var response = await _handler.Handle(command, CancellationToken.None);

        // Assert
        response.WorkingHours.Should().HaveCount(5); // Mon-Fri
        response.WorkingHours.Should().OnlyContain(wh => 
            wh.StartTime == new TimeOnly(8, 0) && 
            wh.EndTime == new TimeOnly(17, 0));
        response.WorkingHours.Select(wh => wh.DayOfWeek).Should().BeEquivalentTo(new[] { 1, 2, 3, 4, 5 });
    }

    [Fact]
    public async Task Handle_WithCustomWorkingHours_ShouldUseProvidedHours()
    {
        // Arrange
        var customHours = new List<WorkingHours>
        {
            new() { DayOfWeek = 1, StartTime = new TimeOnly(9, 0), EndTime = new TimeOnly(18, 0) },
            new() { DayOfWeek = 2, StartTime = new TimeOnly(9, 0), EndTime = new TimeOnly(18, 0) }
        };

        var command = new CreateContractorCommand
        {
            Name = "Bob Builder",
            Type = ContractorType.Carpet,
            PhoneNumber = "555-9999",
            Email = "bob@example.com",
            BaseLocation = new BaseLocation
            {
                Latitude = 41.8781m,
                Longitude = -87.6298m,
                Address = "789 Elm St",
                City = "Chicago",
                State = "IL",
                ZipCode = "60601"
            },
            WorkingHours = customHours
        };

        // Act
        var response = await _handler.Handle(command, CancellationToken.None);

        // Assert
        response.WorkingHours.Should().HaveCount(2);
        response.WorkingHours.Should().BeEquivalentTo(customHours);
    }

    [Fact]
    public async Task Handle_WithDuplicateNameAndLocation_ShouldThrowException()
    {
        // Arrange
        var baseLocation = new BaseLocation
        {
            Latitude = 40.7128m,
            Longitude = -74.0060m,
            Address = "123 Main St",
            City = "New York",
            State = "NY",
            ZipCode = "10001"
        };

        var command1 = new CreateContractorCommand
        {
            Name = "Duplicate Name",
            Type = ContractorType.Flooring,
            PhoneNumber = "555-1111",
            Email = "first@example.com",
            BaseLocation = baseLocation
        };

        var command2 = new CreateContractorCommand
        {
            Name = "Duplicate Name",
            Type = ContractorType.Tile,
            PhoneNumber = "555-2222",
            Email = "second@example.com",
            BaseLocation = baseLocation
        };

        await _handler.Handle(command1, CancellationToken.None);

        // Act & Assert
        await Assert.ThrowsAsync<InvalidOperationException>(() => 
            _handler.Handle(command2, CancellationToken.None));
    }

    [Fact]
    public async Task Handle_WithDifferentLocation_ShouldAllowSameName()
    {
        // Arrange
        var command1 = new CreateContractorCommand
        {
            Name = "Same Name",
            Type = ContractorType.Flooring,
            PhoneNumber = "555-1111",
            Email = "first@example.com",
            BaseLocation = new BaseLocation
            {
                Latitude = 40.7128m,
                Longitude = -74.0060m,
                Address = "123 Main St",
                City = "New York",
                State = "NY",
                ZipCode = "10001"
            }
        };

        var command2 = new CreateContractorCommand
        {
            Name = "Same Name",
            Type = ContractorType.Tile,
            PhoneNumber = "555-2222",
            Email = "second@example.com",
            BaseLocation = new BaseLocation
            {
                Latitude = 34.0522m,
                Longitude = -118.2437m,
                Address = "456 Oak Ave",
                City = "Los Angeles",
                State = "CA",
                ZipCode = "90001"
            }
        };

        // Act
        var response1 = await _handler.Handle(command1, CancellationToken.None);
        var response2 = await _handler.Handle(command2, CancellationToken.None);

        // Assert
        response1.Id.Should().NotBe(response2.Id);
        response1.Name.Should().Be(response2.Name);
    }

    [Fact]
    public async Task Handle_ShouldGenerateUniqueGuid()
    {
        // Arrange
        var command = new CreateContractorCommand
        {
            Name = "Unique Test",
            Type = ContractorType.Multi,
            PhoneNumber = "555-0000",
            Email = "unique@example.com",
            BaseLocation = new BaseLocation
            {
                Latitude = 40.7128m,
                Longitude = -74.0060m,
                Address = "123 Test St",
                City = "Test City",
                State = "TS",
                ZipCode = "12345"
            }
        };

        // Act
        var response = await _handler.Handle(command, CancellationToken.None);

        // Assert
        response.Id.Should().NotBeEmpty();
        var contractor = await _context.Contractors.FindAsync(response.Id);
        contractor.Should().NotBeNull();
        contractor!.Id.Should().Be(response.Id);
    }

    public void Dispose()
    {
        _context.Dispose();
    }
}
