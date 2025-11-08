# SmartScheduler - Backend Requirements Document

**Version:** 1.0
**Date:** 2025-11-08
**Technology Stack:** .NET 8 (C#), PostgreSQL, AWS
**Architecture:** Domain-Driven Design, CQRS, Vertical Slice Architecture
**Related Documents:** PRD-Master.md, PRD-Frontend.md, API-Specification.md

---

## Table of Contents
1. [Overview](#1-overview)
2. [Technology Stack](#2-technology-stack)
3. [Architecture](#3-architecture)
4. [Domain Model](#4-domain-model)
5. [Application Layer](#5-application-layer)
6. [Infrastructure Layer](#6-infrastructure-layer)
7. [API Layer](#7-api-layer)
8. [Database Design](#8-database-design)
9. [External Integrations](#9-external-integrations)
10. [Security](#10-security)
11. [Performance & Scalability](#11-performance--scalability)
12. [Monitoring & Logging](#12-monitoring--logging)
13. [Testing Strategy](#13-testing-strategy)
14. [Deployment](#14-deployment)
15. [DevOps & CI/CD](#15-devops--cicd)

---

## 1. Overview

### 1.1 Purpose
The SmartScheduler backend is a .NET 8 Web API that provides intelligent contractor discovery and job assignment capabilities through a CQRS-based, event-driven architecture following Domain-Driven Design principles.

### 1.2 Core Responsibilities
- Manage contractor and job domain entities
- Calculate contractor availability and proximity
- Execute weighted scoring algorithm for contractor ranking
- Handle job-to-contractor assignments
- Publish domain events for real-time updates
- Integrate with external mapping services
- Provide RESTful API endpoints for frontend consumption

### 1.3 Architectural Principles
- **Domain-Driven Design**: Rich domain model with business logic encapsulation
- **CQRS**: Separated command and query responsibilities
- **Vertical Slice Architecture**: Features organized by business capability
- **Event-Driven**: Asynchronous communication via domain events
- **Clean Architecture**: Layer separation with dependency inversion

---

## 2. Technology Stack

### 2.1 Core Technologies

```json
{
  "framework": ".NET 8 SDK",
  "language": "C# 12",
  "apiFramework": "ASP.NET Core Web API 8.0",
  "database": "PostgreSQL 15+",
  "orm": "Entity Framework Core 8.0",
  "realTime": "SignalR",
  "cloudPlatform": "AWS"
}
```

### 2.2 NuGet Packages

**Core Framework**
```xml
<PackageReference Include="Microsoft.AspNetCore.OpenApi" Version="8.0.0" />
<PackageReference Include="Swashbuckle.AspNetCore" Version="6.5.0" />
<PackageReference Include="Microsoft.AspNetCore.SignalR" Version="8.0.0" />
```

**Database & ORM**
```xml
<PackageReference Include="Npgsql.EntityFrameworkCore.PostgreSQL" Version="8.0.0" />
<PackageReference Include="Microsoft.EntityFrameworkCore.Design" Version="8.0.0" />
<PackageReference Include="EFCore.NamingConventions" Version="8.0.0" />
```

**CQRS & Mediator Pattern**
```xml
<PackageReference Include="MediatR" Version="12.2.0" />
<PackageReference Include="FluentValidation.AspNetCore" Version="11.3.0" />
```

**Authentication & Authorization**
```xml
<PackageReference Include="Microsoft.AspNetCore.Authentication.JwtBearer" Version="8.0.0" />
<PackageReference Include="Microsoft.AspNetCore.Identity.EntityFrameworkCore" Version="8.0.0" />
```

**Caching**
```xml
<PackageReference Include="StackExchange.Redis" Version="2.7.0" />
<PackageReference Include="Microsoft.Extensions.Caching.StackExchangeRedis" Version="8.0.0" />
```

**External Integrations**
```xml
<PackageReference Include="GoogleApi" Version="5.1.0" />
<PackageReference Include="NetTopologySuite" Version="2.5.0" />
```

**Messaging**
```xml
<PackageReference Include="AWSSDK.SQS" Version="3.7.0" />
<PackageReference Include="AWSSDK.SNS" Version="3.7.0" />
```

**Logging & Monitoring**
```xml
<PackageReference Include="Serilog.AspNetCore" Version="8.0.0" />
<PackageReference Include="Serilog.Sinks.Console" Version="5.0.0" />
<PackageReference Include="Serilog.Sinks.File" Version="5.0.0" />
<PackageReference Include="Serilog.Sinks.Seq" Version="7.0.0" />
<PackageReference Include="AWSSDK.CloudWatch" Version="3.7.0" />
```

**Testing**
```xml
<PackageReference Include="xUnit" Version="2.6.0" />
<PackageReference Include="Moq" Version="4.20.0" />
<PackageReference Include="FluentAssertions" Version="6.12.0" />
<PackageReference Include="Testcontainers.PostgreSql" Version="3.7.0" />
```

**AI/LLM Integration (Optional)**
```xml
<PackageReference Include="OpenAI" Version="1.11.0" />
<PackageReference Include="LangChain" Version="0.12.0" />
```

---

## 3. Architecture

### 3.1 Solution Structure

```
SmartScheduler.sln
│
├── src/
│   ├── SmartScheduler.API/                  # API Layer
│   │   ├── Controllers/
│   │   ├── Hubs/                            # SignalR hubs
│   │   ├── Middleware/
│   │   ├── Filters/
│   │   ├── Program.cs
│   │   └── appsettings.json
│   │
│   ├── SmartScheduler.Application/          # Application Layer
│   │   ├── Features/
│   │   │   ├── Contractors/
│   │   │   │   ├── Commands/
│   │   │   │   │   ├── CreateContractor/
│   │   │   │   │   │   ├── CreateContractorCommand.cs
│   │   │   │   │   │   ├── CreateContractorCommandHandler.cs
│   │   │   │   │   │   └── CreateContractorCommandValidator.cs
│   │   │   │   │   ├── UpdateContractor/
│   │   │   │   │   └── DeleteContractor/
│   │   │   │   └── Queries/
│   │   │   │       ├── GetContractors/
│   │   │   │       ├── GetContractorById/
│   │   │   │       └── GetContractorSchedule/
│   │   │   ├── Jobs/
│   │   │   │   ├── Commands/
│   │   │   │   └── Queries/
│   │   │   ├── Assignments/
│   │   │   │   ├── Commands/
│   │   │   │   └── Queries/
│   │   │   └── Recommendations/
│   │   │       └── Queries/
│   │   │           └── GetRecommendations/
│   │   │               ├── GetRecommendationsQuery.cs
│   │   │               ├── GetRecommendationsQueryHandler.cs
│   │   │               └── RecommendationDto.cs
│   │   ├── Common/
│   │   │   ├── Interfaces/
│   │   │   ├── Behaviors/
│   │   │   ├── Mappings/
│   │   │   └── Exceptions/
│   │   └── DependencyInjection.cs
│   │
│   ├── SmartScheduler.Domain/               # Domain Layer
│   │   ├── Entities/
│   │   │   ├── Contractor.cs
│   │   │   ├── Job.cs
│   │   │   ├── Assignment.cs
│   │   │   └── BaseEntity.cs
│   │   ├── ValueObjects/
│   │   │   ├── Location.cs
│   │   │   ├── WorkingHours.cs
│   │   │   ├── TimeSlot.cs
│   │   │   └── ScoringDetails.cs
│   │   ├── Enums/
│   │   │   ├── ContractorType.cs
│   │   │   ├── JobType.cs
│   │   │   ├── JobStatus.cs
│   │   │   └── AssignmentStatus.cs
│   │   ├── Events/
│   │   │   ├── JobAssignedEvent.cs
│   │   │   ├── ScheduleUpdatedEvent.cs
│   │   │   └── ContractorRatedEvent.cs
│   │   ├── Services/
│   │   │   ├── AvailabilityService.cs
│   │   │   └── ScoringService.cs
│   │   └── Interfaces/
│   │       └── IRepository.cs
│   │
│   ├── SmartScheduler.Infrastructure/       # Infrastructure Layer
│   │   ├── Persistence/
│   │   │   ├── ApplicationDbContext.cs
│   │   │   ├── Configurations/
│   │   │   │   ├── ContractorConfiguration.cs
│   │   │   │   ├── JobConfiguration.cs
│   │   │   │   └── AssignmentConfiguration.cs
│   │   │   ├── Repositories/
│   │   │   │   ├── ContractorRepository.cs
│   │   │   │   ├── JobRepository.cs
│   │   │   │   └── AssignmentRepository.cs
│   │   │   └── Migrations/
│   │   ├── Services/
│   │   │   ├── GoogleMapsService.cs
│   │   │   ├── OpenRouteService.cs
│   │   │   ├── OpenAIService.cs
│   │   │   └── EmailService.cs
│   │   ├── Messaging/
│   │   │   ├── EventBus.cs
│   │   │   ├── SnsPublisher.cs
│   │   │   └── SqsConsumer.cs
│   │   ├── Caching/
│   │   │   └── RedisCacheService.cs
│   │   └── DependencyInjection.cs
│   │
│   └── SmartScheduler.Shared/               # Shared Kernel
│       ├── Constants/
│       ├── Extensions/
│       └── Utilities/
│
├── tests/
│   ├── SmartScheduler.UnitTests/
│   │   ├── Domain/
│   │   ├── Application/
│   │   └── Infrastructure/
│   ├── SmartScheduler.IntegrationTests/
│   │   ├── Api/
│   │   ├── Database/
│   │   └── ExternalServices/
│   └── SmartScheduler.FunctionalTests/
│       └── EndToEnd/
│
└── docs/
    ├── architecture/
    └── api/
```

### 3.2 Architectural Layers

#### Domain Layer (Core)
- **Entities**: Business objects with identity and lifecycle
- **Value Objects**: Immutable objects without identity
- **Domain Services**: Business logic that doesn't fit in entities
- **Domain Events**: Capture domain-significant occurrences
- **Repository Interfaces**: Data access abstractions

**Rules:**
- No dependencies on other layers
- Pure business logic only
- Framework-agnostic
- Rich domain model (not anemic)

#### Application Layer
- **Commands**: Write operations (Create, Update, Delete)
- **Queries**: Read operations (Get, List, Search)
- **Command/Query Handlers**: Execute business operations
- **Validators**: Input validation using FluentValidation
- **DTOs**: Data transfer objects for API responses
- **Application Services**: Orchestrate domain services

**Rules:**
- Depends on Domain layer only
- Uses MediatR for CQRS pattern
- Validates all inputs
- Maps domain entities to DTOs
- Orchestrates workflows

#### Infrastructure Layer
- **Database**: EF Core, PostgreSQL
- **External Services**: Google Maps, OpenAI
- **Messaging**: AWS SNS/SQS
- **Caching**: Redis
- **File Storage**: AWS S3 (if needed)
- **Email**: AWS SES

**Rules:**
- Implements domain interfaces
- Contains all external dependencies
- Handles infrastructure concerns
- No business logic

#### API Layer (Presentation)
- **Controllers**: HTTP endpoints
- **SignalR Hubs**: Real-time communication
- **Middleware**: Request/response pipeline
- **Filters**: Cross-cutting concerns
- **Swagger/OpenAPI**: API documentation

**Rules:**
- Thin controllers (delegate to handlers)
- Input validation
- Error handling
- Authentication/Authorization
- API versioning

---

## 4. Domain Model

### 4.1 Domain Entities

#### Contractor Entity

```csharp
namespace SmartScheduler.Domain.Entities;

public class Contractor : BaseEntity
{
    // Properties
    public string Name { get; private set; }
    public ContractorType Type { get; private set; }
    public decimal Rating { get; private set; }
    public Location BaseLocation { get; private set; }
    public List<WorkingHours> WorkingSchedule { get; private set; }
    public ContractorStatus Status { get; private set; }
    public string PhoneNumber { get; private set; }
    public string Email { get; private set; }
    public List<string> Skills { get; private set; }

    // Navigation properties
    public virtual ICollection<Assignment> Assignments { get; private set; }

    // Factory method
    public static Contractor Create(
        string name,
        ContractorType type,
        Location baseLocation,
        string phoneNumber,
        string email,
        List<WorkingHours> workingSchedule)
    {
        // Business rules validation
        if (string.IsNullOrWhiteSpace(name))
            throw new DomainException("Contractor name is required");

        if (workingSchedule == null || !workingSchedule.Any())
            throw new DomainException("At least one working day is required");

        var contractor = new Contractor
        {
            Id = Guid.NewGuid(),
            Name = name,
            Type = type,
            BaseLocation = baseLocation ?? throw new ArgumentNullException(nameof(baseLocation)),
            PhoneNumber = phoneNumber,
            Email = email,
            WorkingSchedule = workingSchedule,
            Rating = 0.0m, // Default rating
            Status = ContractorStatus.Active,
            Skills = new List<string>(),
            Assignments = new List<Assignment>(),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        return contractor;
    }

    // Business methods
    public void UpdateRating(decimal newRating)
    {
        if (newRating < 0 || newRating > 5)
            throw new DomainException("Rating must be between 0 and 5");

        Rating = newRating;
        UpdatedAt = DateTime.UtcNow;

        AddDomainEvent(new ContractorRatedEvent(Id, newRating));
    }

    public void UpdateSchedule(List<WorkingHours> newSchedule)
    {
        if (newSchedule == null || !newSchedule.Any())
            throw new DomainException("At least one working day is required");

        WorkingSchedule = newSchedule;
        UpdatedAt = DateTime.UtcNow;

        AddDomainEvent(new ScheduleUpdatedEvent(Id, newSchedule));
    }

    public void Deactivate()
    {
        if (Status == ContractorStatus.Inactive)
            throw new DomainException("Contractor is already inactive");

        Status = ContractorStatus.Inactive;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Activate()
    {
        if (Status == ContractorStatus.Active)
            throw new DomainException("Contractor is already active");

        Status = ContractorStatus.Active;
        UpdatedAt = DateTime.UtcNow;
    }

    public bool IsAvailableOn(DateTime date)
    {
        if (Status != ContractorStatus.Active)
            return false;

        var dayOfWeek = (int)date.DayOfWeek;
        return WorkingSchedule.Any(wh => wh.DayOfWeek == dayOfWeek);
    }

    private Contractor() { } // EF Core
}
```

#### Job Entity

```csharp
namespace SmartScheduler.Domain.Entities;

public class Job : BaseEntity
{
    // Properties
    public string JobNumber { get; private set; }
    public JobType Type { get; private set; }
    public DateTime DesiredDate { get; private set; }
    public Location Location { get; private set; }
    public TimeSpan Duration { get; private set; }
    public JobStatus Status { get; private set; }
    public Priority Priority { get; private set; }
    public List<string> SpecialRequirements { get; private set; }

    // Navigation properties
    public Guid? AssignedContractorId { get; private set; }
    public virtual Contractor? AssignedContractor { get; private set; }
    public virtual Assignment? Assignment { get; private set; }

    // Factory method
    public static Job Create(
        JobType type,
        DateTime desiredDate,
        Location location,
        TimeSpan duration,
        Priority priority = Priority.Medium)
    {
        if (desiredDate < DateTime.UtcNow)
            throw new DomainException("Job desired date cannot be in the past");

        if (duration <= TimeSpan.Zero || duration > TimeSpan.FromHours(8))
            throw new DomainException("Job duration must be between 0 and 8 hours");

        var job = new Job
        {
            Id = Guid.NewGuid(),
            JobNumber = GenerateJobNumber(),
            Type = type,
            DesiredDate = desiredDate,
            Location = location ?? throw new ArgumentNullException(nameof(location)),
            Duration = duration,
            Status = JobStatus.Open,
            Priority = priority,
            SpecialRequirements = new List<string>(),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        return job;
    }

    // Business methods
    public void AssignToContractor(Guid contractorId, TimeSlot timeSlot)
    {
        if (Status != JobStatus.Open)
            throw new DomainException("Only open jobs can be assigned");

        AssignedContractorId = contractorId;
        Status = JobStatus.Assigned;
        UpdatedAt = DateTime.UtcNow;

        AddDomainEvent(new JobAssignedEvent(Id, contractorId, timeSlot));
    }

    public void Cancel(string reason)
    {
        if (Status == JobStatus.Completed)
            throw new DomainException("Cannot cancel a completed job");

        Status = JobStatus.Cancelled;
        UpdatedAt = DateTime.UtcNow;

        AddDomainEvent(new JobCancelledEvent(Id, reason));
    }

    public void MarkInProgress()
    {
        if (Status != JobStatus.Assigned)
            throw new DomainException("Only assigned jobs can be marked in progress");

        Status = JobStatus.InProgress;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Complete()
    {
        if (Status != JobStatus.InProgress)
            throw new DomainException("Only in-progress jobs can be completed");

        Status = JobStatus.Completed;
        UpdatedAt = DateTime.UtcNow;

        AddDomainEvent(new JobCompletedEvent(Id, DateTime.UtcNow));
    }

    private static string GenerateJobNumber()
    {
        return $"JOB-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString().Substring(0, 8).ToUpper()}";
    }

    private Job() { } // EF Core
}
```

#### Assignment Entity

```csharp
namespace SmartScheduler.Domain.Entities;

public class Assignment : BaseEntity
{
    // Properties
    public Guid JobId { get; private set; }
    public Guid ContractorId { get; private set; }
    public TimeSlot ScheduledTimeSlot { get; private set; }
    public AssignmentStatus Status { get; private set; }
    public decimal Score { get; private set; }
    public ScoringDetails ScoreBreakdown { get; private set; }
    public DateTime? ConfirmedAt { get; private set; }
    public DateTime? StartedAt { get; private set; }
    public DateTime? CompletedAt { get; private set; }
    public string? CancellationReason { get; private set; }

    // Navigation properties
    public virtual Job Job { get; private set; }
    public virtual Contractor Contractor { get; private set; }

    // Factory method
    public static Assignment Create(
        Guid jobId,
        Guid contractorId,
        TimeSlot scheduledTimeSlot,
        decimal score,
        ScoringDetails scoreBreakdown)
    {
        if (scheduledTimeSlot == null)
            throw new ArgumentNullException(nameof(scheduledTimeSlot));

        if (score < 0 || score > 1)
            throw new DomainException("Score must be between 0 and 1");

        var assignment = new Assignment
        {
            Id = Guid.NewGuid(),
            JobId = jobId,
            ContractorId = contractorId,
            ScheduledTimeSlot = scheduledTimeSlot,
            Status = AssignmentStatus.Pending,
            Score = score,
            ScoreBreakdown = scoreBreakdown,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        return assignment;
    }

    // Business methods
    public void Confirm()
    {
        if (Status != AssignmentStatus.Pending)
            throw new DomainException("Only pending assignments can be confirmed");

        Status = AssignmentStatus.Confirmed;
        ConfirmedAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;

        AddDomainEvent(new AssignmentConfirmedEvent(Id, JobId, ContractorId));
    }

    public void Start()
    {
        if (Status != AssignmentStatus.Confirmed)
            throw new DomainException("Only confirmed assignments can be started");

        Status = AssignmentStatus.InProgress;
        StartedAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Complete()
    {
        if (Status != AssignmentStatus.InProgress)
            throw new DomainException("Only in-progress assignments can be completed");

        Status = AssignmentStatus.Completed;
        CompletedAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Cancel(string reason)
    {
        if (Status == AssignmentStatus.Completed)
            throw new DomainException("Cannot cancel a completed assignment");

        Status = AssignmentStatus.Cancelled;
        CancellationReason = reason;
        UpdatedAt = DateTime.UtcNow;

        AddDomainEvent(new AssignmentCancelledEvent(Id, JobId, reason));
    }

    private Assignment() { } // EF Core
}
```

#### Base Entity

```csharp
namespace SmartScheduler.Domain.Entities;

public abstract class BaseEntity
{
    public Guid Id { get; protected set; }
    public DateTime CreatedAt { get; protected set; }
    public DateTime UpdatedAt { get; protected set; }

    private readonly List<IDomainEvent> _domainEvents = new();
    public IReadOnlyList<IDomainEvent> DomainEvents => _domainEvents.AsReadOnly();

    protected void AddDomainEvent(IDomainEvent domainEvent)
    {
        _domainEvents.Add(domainEvent);
    }

    public void ClearDomainEvents()
    {
        _domainEvents.Clear();
    }
}
```

### 4.2 Value Objects

#### Location Value Object

```csharp
namespace SmartScheduler.Domain.ValueObjects;

public class Location : ValueObject
{
    public decimal Latitude { get; private set; }
    public decimal Longitude { get; private set; }
    public string Address { get; private set; }
    public string City { get; private set; }
    public string State { get; private set; }
    public string ZipCode { get; private set; }

    public Location(
        decimal latitude,
        decimal longitude,
        string address,
        string city,
        string state,
        string zipCode)
    {
        if (latitude < -90 || latitude > 90)
            throw new ArgumentException("Latitude must be between -90 and 90");

        if (longitude < -180 || longitude > 180)
            throw new ArgumentException("Longitude must be between -180 and 180");

        if (string.IsNullOrWhiteSpace(address))
            throw new ArgumentException("Address is required");

        Latitude = latitude;
        Longitude = longitude;
        Address = address;
        City = city;
        State = state;
        ZipCode = zipCode;
    }

    public decimal DistanceTo(Location other)
    {
        // Haversine formula for distance calculation
        const double EarthRadiusMiles = 3959;

        var lat1 = (double)Latitude * Math.PI / 180;
        var lat2 = (double)other.Latitude * Math.PI / 180;
        var deltaLat = lat2 - lat1;
        var deltaLon = (double)(other.Longitude - Longitude) * Math.PI / 180;

        var a = Math.Sin(deltaLat / 2) * Math.Sin(deltaLat / 2) +
                Math.Cos(lat1) * Math.Cos(lat2) *
                Math.Sin(deltaLon / 2) * Math.Sin(deltaLon / 2);

        var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));

        return (decimal)(EarthRadiusMiles * c);
    }

    public bool IsWithinRadius(Location center, decimal radiusMiles)
    {
        return DistanceTo(center) <= radiusMiles;
    }

    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return Latitude;
        yield return Longitude;
        yield return Address;
        yield return City;
        yield return State;
        yield return ZipCode;
    }
}
```

#### WorkingHours Value Object

```csharp
namespace SmartScheduler.Domain.ValueObjects;

public class WorkingHours : ValueObject
{
    public int DayOfWeek { get; private set; } // 0 = Sunday, 6 = Saturday
    public TimeSpan StartTime { get; private set; }
    public TimeSpan EndTime { get; private set; }

    public WorkingHours(int dayOfWeek, TimeSpan startTime, TimeSpan endTime)
    {
        if (dayOfWeek < 0 || dayOfWeek > 6)
            throw new ArgumentException("DayOfWeek must be between 0 and 6");

        if (startTime >= endTime)
            throw new ArgumentException("StartTime must be before EndTime");

        if (endTime - startTime > TimeSpan.FromHours(16))
            throw new ArgumentException("Working hours cannot exceed 16 hours per day");

        DayOfWeek = dayOfWeek;
        StartTime = startTime;
        EndTime = endTime;
    }

    public bool IsAvailableAt(DateTime dateTime)
    {
        if ((int)dateTime.DayOfWeek != DayOfWeek)
            return false;

        var timeOfDay = dateTime.TimeOfDay;
        return timeOfDay >= StartTime && timeOfDay <= EndTime;
    }

    public List<TimeSlot> GetAvailableSlots(
        DateTime date,
        TimeSpan duration,
        List<TimeSlot> existingBookings)
    {
        var slots = new List<TimeSlot>();
        var currentTime = StartTime;

        while (currentTime + duration <= EndTime)
        {
            var slotStart = date.Date + currentTime;
            var slotEnd = slotStart + duration;
            var potentialSlot = new TimeSlot(slotStart, slotEnd);

            // Check if slot doesn't overlap with existing bookings
            if (!existingBookings.Any(b => b.OverlapsWith(potentialSlot)))
            {
                slots.Add(potentialSlot);
            }

            currentTime += TimeSpan.FromMinutes(30); // 30-minute increments
        }

        return slots;
    }

    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return DayOfWeek;
        yield return StartTime;
        yield return EndTime;
    }
}
```

#### TimeSlot Value Object

```csharp
namespace SmartScheduler.Domain.ValueObjects;

public class TimeSlot : ValueObject
{
    public DateTime StartTime { get; private set; }
    public DateTime EndTime { get; private set; }
    public TimeSpan Duration => EndTime - StartTime;

    public TimeSlot(DateTime startTime, DateTime endTime)
    {
        if (startTime >= endTime)
            throw new ArgumentException("StartTime must be before EndTime");

        StartTime = startTime;
        EndTime = endTime;
    }

    public bool OverlapsWith(TimeSlot other)
    {
        return StartTime < other.EndTime && other.StartTime < EndTime;
    }

    public bool Contains(DateTime time)
    {
        return time >= StartTime && time <= EndTime;
    }

    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return StartTime;
        yield return EndTime;
    }
}
```

#### ScoringDetails Value Object

```csharp
namespace SmartScheduler.Domain.ValueObjects;

public class ScoringDetails : ValueObject
{
    public decimal AvailabilityScore { get; private set; }
    public decimal RatingScore { get; private set; }
    public decimal DistanceScore { get; private set; }
    public decimal AvailabilityWeight { get; private set; }
    public decimal RatingWeight { get; private set; }
    public decimal DistanceWeight { get; private set; }
    public string? Explanation { get; private set; }

    public ScoringDetails(
        decimal availabilityScore,
        decimal ratingScore,
        decimal distanceScore,
        decimal availabilityWeight,
        decimal ratingWeight,
        decimal distanceWeight,
        string? explanation = null)
    {
        ValidateScore(availabilityScore, nameof(availabilityScore));
        ValidateScore(ratingScore, nameof(ratingScore));
        ValidateScore(distanceScore, nameof(distanceScore));
        ValidateWeight(availabilityWeight, nameof(availabilityWeight));
        ValidateWeight(ratingWeight, nameof(ratingWeight));
        ValidateWeight(distanceWeight, nameof(distanceWeight));

        AvailabilityScore = availabilityScore;
        RatingScore = ratingScore;
        DistanceScore = distanceScore;
        AvailabilityWeight = availabilityWeight;
        RatingWeight = ratingWeight;
        DistanceWeight = distanceWeight;
        Explanation = explanation;
    }

    public decimal CalculateTotalScore()
    {
        return (AvailabilityWeight * AvailabilityScore) +
               (RatingWeight * RatingScore) +
               (DistanceWeight * DistanceScore);
    }

    private static void ValidateScore(decimal score, string paramName)
    {
        if (score < 0 || score > 1)
            throw new ArgumentException($"{paramName} must be between 0 and 1", paramName);
    }

    private static void ValidateWeight(decimal weight, string paramName)
    {
        if (weight < 0 || weight > 1)
            throw new ArgumentException($"{paramName} must be between 0 and 1", paramName);
    }

    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return AvailabilityScore;
        yield return RatingScore;
        yield return DistanceScore;
        yield return AvailabilityWeight;
        yield return RatingWeight;
        yield return DistanceWeight;
    }
}
```

### 4.3 Enumerations

```csharp
namespace SmartScheduler.Domain.Enums;

public enum ContractorType
{
    Flooring = 1,
    Tile = 2,
    Carpet = 3,
    Multi = 4
}

public enum ContractorStatus
{
    Active = 1,
    Inactive = 2,
    OnLeave = 3
}

public enum JobType
{
    Flooring = 1,
    Tile = 2,
    Carpet = 3
}

public enum JobStatus
{
    Open = 1,
    Assigned = 2,
    InProgress = 3,
    Completed = 4,
    Cancelled = 5
}

public enum AssignmentStatus
{
    Pending = 1,
    Confirmed = 2,
    InProgress = 3,
    Completed = 4,
    Cancelled = 5
}

public enum Priority
{
    Low = 1,
    Medium = 2,
    High = 3,
    Urgent = 4
}
```

### 4.4 Domain Services

#### Availability Service

```csharp
namespace SmartScheduler.Domain.Services;

public interface IAvailabilityService
{
    Task<List<TimeSlot>> GetAvailableTimeSlotsAsync(
        Guid contractorId,
        DateTime date,
        TimeSpan duration,
        CancellationToken cancellationToken = default);

    Task<bool> IsAvailableAsync(
        Guid contractorId,
        TimeSlot timeSlot,
        CancellationToken cancellationToken = default);
}

public class AvailabilityService : IAvailabilityService
{
    private readonly IContractorRepository _contractorRepository;
    private readonly IAssignmentRepository _assignmentRepository;

    public AvailabilityService(
        IContractorRepository contractorRepository,
        IAssignmentRepository assignmentRepository)
    {
        _contractorRepository = contractorRepository;
        _assignmentRepository = assignmentRepository;
    }

    public async Task<List<TimeSlot>> GetAvailableTimeSlotsAsync(
        Guid contractorId,
        DateTime date,
        TimeSpan duration,
        CancellationToken cancellationToken = default)
    {
        var contractor = await _contractorRepository.GetByIdAsync(contractorId, cancellationToken);
        if (contractor == null)
            throw new NotFoundException($"Contractor {contractorId} not found");

        if (!contractor.IsAvailableOn(date))
            return new List<TimeSlot>();

        var dayOfWeek = (int)date.DayOfWeek;
        var workingHours = contractor.WorkingSchedule
            .FirstOrDefault(wh => wh.DayOfWeek == dayOfWeek);

        if (workingHours == null)
            return new List<TimeSlot>();

        // Get existing assignments for the day
        var existingAssignments = await _assignmentRepository
            .GetByContractorAndDateAsync(contractorId, date, cancellationToken);

        var bookedSlots = existingAssignments
            .Where(a => a.Status != AssignmentStatus.Cancelled)
            .Select(a => a.ScheduledTimeSlot)
            .ToList();

        // Calculate available slots
        return workingHours.GetAvailableSlots(date, duration, bookedSlots);
    }

    public async Task<bool> IsAvailableAsync(
        Guid contractorId,
        TimeSlot timeSlot,
        CancellationToken cancellationToken = default)
    {
        var availableSlots = await GetAvailableTimeSlotsAsync(
            contractorId,
            timeSlot.StartTime.Date,
            timeSlot.Duration,
            cancellationToken);

        return availableSlots.Any(slot =>
            slot.StartTime == timeSlot.StartTime &&
            slot.EndTime == timeSlot.EndTime);
    }
}
```

#### Scoring Service

```csharp
namespace SmartScheduler.Domain.Services;

public interface IScoringService
{
    ScoringDetails CalculateScore(
        Contractor contractor,
        Job job,
        DateTime earliestAvailability,
        decimal distanceInMiles);
}

public class ScoringService : IScoringService
{
    private readonly ScoringConfiguration _config;

    public ScoringService(IOptions<ScoringConfiguration> config)
    {
        _config = config.Value;
    }

    public ScoringDetails CalculateScore(
        Contractor contractor,
        Job job,
        DateTime earliestAvailability,
        decimal distanceInMiles)
    {
        // Calculate availability score
        var daysDifference = (earliestAvailability.Date - job.DesiredDate.Date).Days;
        var availabilityScore = CalculateAvailabilityScore(daysDifference);

        // Calculate rating score
        var ratingScore = CalculateRatingScore(contractor.Rating);

        // Calculate distance score
        var distanceScore = CalculateDistanceScore(distanceInMiles);

        return new ScoringDetails(
            availabilityScore: availabilityScore,
            ratingScore: ratingScore,
            distanceScore: distanceScore,
            availabilityWeight: _config.AvailabilityWeight,
            ratingWeight: _config.RatingWeight,
            distanceWeight: _config.DistanceWeight
        );
    }

    private decimal CalculateAvailabilityScore(int daysDifference)
    {
        // Perfect score for same day, decreasing by 0.1 per day
        // Minimum score of 0.0 after 10+ days
        if (daysDifference <= 0)
            return 1.0m;

        var score = 1.0m - (daysDifference * 0.1m);
        return Math.Max(0.0m, score);
    }

    private decimal CalculateRatingScore(decimal rating)
    {
        // Normalize rating from 0-5 scale to 0-1 scale
        return rating / 5.0m;
    }

    private decimal CalculateDistanceScore(decimal distanceInMiles)
    {
        // Linear decay from 1.0 at 0 miles to 0.0 at maxDistance miles
        if (distanceInMiles <= 0)
            return 1.0m;

        if (distanceInMiles >= _config.MaxDistanceMiles)
            return 0.0m;

        return 1.0m - (distanceInMiles / _config.MaxDistanceMiles);
    }
}

public class ScoringConfiguration
{
    public decimal AvailabilityWeight { get; set; } = 0.40m;
    public decimal RatingWeight { get; set; } = 0.35m;
    public decimal DistanceWeight { get; set; } = 0.25m;
    public decimal MaxDistanceMiles { get; set; } = 50.0m;
}
```

### 4.5 Domain Events

```csharp
namespace SmartScheduler.Domain.Events;

public interface IDomainEvent
{
    DateTime OccurredOn { get; }
}

public class JobAssignedEvent : IDomainEvent
{
    public Guid JobId { get; }
    public Guid ContractorId { get; }
    public TimeSlot TimeSlot { get; }
    public DateTime OccurredOn { get; }

    public JobAssignedEvent(Guid jobId, Guid contractorId, TimeSlot timeSlot)
    {
        JobId = jobId;
        ContractorId = contractorId;
        TimeSlot = timeSlot;
        OccurredOn = DateTime.UtcNow;
    }
}

public class ScheduleUpdatedEvent : IDomainEvent
{
    public Guid ContractorId { get; }
    public List<WorkingHours> UpdatedSchedule { get; }
    public DateTime OccurredOn { get; }

    public ScheduleUpdatedEvent(Guid contractorId, List<WorkingHours> updatedSchedule)
    {
        ContractorId = contractorId;
        UpdatedSchedule = updatedSchedule;
        OccurredOn = DateTime.UtcNow;
    }
}

public class ContractorRatedEvent : IDomainEvent
{
    public Guid ContractorId { get; }
    public decimal NewRating { get; }
    public DateTime OccurredOn { get; }

    public ContractorRatedEvent(Guid contractorId, decimal newRating)
    {
        ContractorId = contractorId;
        NewRating = newRating;
        OccurredOn = DateTime.UtcNow;
    }
}

public class JobCompletedEvent : IDomainEvent
{
    public Guid JobId { get; }
    public DateTime CompletedAt { get; }
    public DateTime OccurredOn { get; }

    public JobCompletedEvent(Guid jobId, DateTime completedAt)
    {
        JobId = jobId;
        CompletedAt = completedAt;
        OccurredOn = DateTime.UtcNow;
    }
}

public class JobCancelledEvent : IDomainEvent
{
    public Guid JobId { get; }
    public string Reason { get; }
    public DateTime OccurredOn { get; }

    public JobCancelledEvent(Guid jobId, string reason)
    {
        JobId = jobId;
        Reason = reason;
        OccurredOn = DateTime.UtcNow;
    }
}

public class AssignmentConfirmedEvent : IDomainEvent
{
    public Guid AssignmentId { get; }
    public Guid JobId { get; }
    public Guid ContractorId { get; }
    public DateTime OccurredOn { get; }

    public AssignmentConfirmedEvent(Guid assignmentId, Guid jobId, Guid contractorId)
    {
        AssignmentId = assignmentId;
        JobId = jobId;
        ContractorId = contractorId;
        OccurredOn = DateTime.UtcNow;
    }
}

public class AssignmentCancelledEvent : IDomainEvent
{
    public Guid AssignmentId { get; }
    public Guid JobId { get; }
    public string Reason { get; }
    public DateTime OccurredOn { get; }

    public AssignmentCancelledEvent(Guid assignmentId, Guid jobId, string reason)
    {
        AssignmentId = assignmentId;
        JobId = jobId;
        Reason = reason;
        OccurredOn = DateTime.UtcNow;
    }
}
```

---

## 5. Application Layer

### 5.1 CQRS Pattern Implementation

The application layer implements CQRS using MediatR for command and query handling.

#### Example Command: CreateContractor

**Command**
```csharp
namespace SmartScheduler.Application.Features.Contractors.Commands.CreateContractor;

public class CreateContractorCommand : IRequest<ContractorDto>
{
    public string Name { get; set; } = string.Empty;
    public ContractorType Type { get; set; }
    public string PhoneNumber { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public LocationDto BaseLocation { get; set; } = null!;
    public List<WorkingHoursDto> WorkingSchedule { get; set; } = new();
}

public class LocationDto
{
    public decimal Latitude { get; set; }
    public decimal Longitude { get; set; }
    public string Address { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public string ZipCode { get; set; } = string.Empty;
}

public class WorkingHoursDto
{
    public int DayOfWeek { get; set; }
    public string StartTime { get; set; } = string.Empty; // "08:00"
    public string EndTime { get; set; } = string.Empty;   // "17:00"
}
```

**Validator**
```csharp
namespace SmartScheduler.Application.Features.Contractors.Commands.CreateContractor;

public class CreateContractorCommandValidator : AbstractValidator<CreateContractorCommand>
{
    public CreateContractorCommandValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Name is required")
            .MinimumLength(2).WithMessage("Name must be at least 2 characters")
            .MaximumLength(100).WithMessage("Name must not exceed 100 characters");

        RuleFor(x => x.Type)
            .IsInEnum().WithMessage("Invalid contractor type");

        RuleFor(x => x.PhoneNumber)
            .NotEmpty().WithMessage("Phone number is required")
            .Matches(@"^\(\d{3}\) \d{3}-\d{4}$")
            .WithMessage("Phone number must be in format (XXX) XXX-XXXX");

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required")
            .EmailAddress().WithMessage("Invalid email format");

        RuleFor(x => x.BaseLocation)
            .NotNull().WithMessage("Base location is required")
            .SetValidator(new LocationDtoValidator());

        RuleFor(x => x.WorkingSchedule)
            .NotEmpty().WithMessage("At least one working day is required")
            .ForEach(schedule => schedule.SetValidator(new WorkingHoursDtoValidator()));
    }
}

public class LocationDtoValidator : AbstractValidator<LocationDto>
{
    public LocationDtoValidator()
    {
        RuleFor(x => x.Latitude)
            .InclusiveBetween(-90, 90).WithMessage("Latitude must be between -90 and 90");

        RuleFor(x => x.Longitude)
            .InclusiveBetween(-180, 180).WithMessage("Longitude must be between -180 and 180");

        RuleFor(x => x.Address).NotEmpty().MinimumLength(5);
        RuleFor(x => x.City).NotEmpty().MinimumLength(2);
        RuleFor(x => x.State).NotEmpty().Length(2);
        RuleFor(x => x.ZipCode).NotEmpty().Matches(@"^\d{5}$");
    }
}
```

**Handler**
```csharp
namespace SmartScheduler.Application.Features.Contractors.Commands.CreateContractor;

public class CreateContractorCommandHandler : IRequestHandler<CreateContractorCommand, ContractorDto>
{
    private readonly IContractorRepository _contractorRepository;
    private readonly IMapper _mapper;
    private readonly ILogger<CreateContractorCommandHandler> _logger;

    public CreateContractorCommandHandler(
        IContractorRepository contractorRepository,
        IMapper mapper,
        ILogger<CreateContractorCommandHandler> logger)
    {
        _contractorRepository = contractorRepository;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<ContractorDto> Handle(
        CreateContractorCommand request,
        CancellationToken cancellationToken)
    {
        _logger.LogInformation("Creating contractor: {Name}", request.Name);

        // Map DTOs to value objects
        var baseLocation = _mapper.Map<Location>(request.BaseLocation);
        var workingSchedule = _mapper.Map<List<WorkingHours>>(request.WorkingSchedule);

        // Create domain entity using factory method
        var contractor = Contractor.Create(
            name: request.Name,
            type: request.Type,
            baseLocation: baseLocation,
            phoneNumber: request.PhoneNumber,
            email: request.Email,
            workingSchedule: workingSchedule
        );

        // Persist to database
        await _contractorRepository.AddAsync(contractor, cancellationToken);
        await _contractorRepository.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Contractor created successfully: {ContractorId}", contractor.Id);

        // Map to DTO and return
        return _mapper.Map<ContractorDto>(contractor);
    }
}
```

#### Example Query: GetRecommendations

**Query**
```csharp
namespace SmartScheduler.Application.Features.Recommendations.Queries.GetRecommendations;

public class GetRecommendationsQuery : IRequest<RecommendationResponse>
{
    public Guid JobId { get; set; }
    public int MaxResults { get; set; } = 10;
}
```

**Handler**
```csharp
namespace SmartScheduler.Application.Features.Recommendations.Queries.GetRecommendations;

public class GetRecommendationsQueryHandler : IRequestHandler<GetRecommendationsQuery, RecommendationResponse>
{
    private readonly IJobRepository _jobRepository;
    private readonly IContractorRepository _contractorRepository;
    private readonly IAvailabilityService _availabilityService;
    private readonly IScoringService _scoringService;
    private readonly IDistanceService _distanceService;
    private readonly IMapper _mapper;
    private readonly ILogger<GetRecommendationsQueryHandler> _logger;

    public GetRecommendationsQueryHandler(
        IJobRepository jobRepository,
        IContractorRepository contractorRepository,
        IAvailabilityService availabilityService,
        IScoringService scoringService,
        IDistanceService distanceService,
        IMapper mapper,
        ILogger<GetRecommendationsQueryHandler> logger)
    {
        _jobRepository = jobRepository;
        _contractorRepository = contractorRepository;
        _availabilityService = availabilityService;
        _scoringService = scoringService;
        _distanceService = distanceService;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<RecommendationResponse> Handle(
        GetRecommendationsQuery request,
        CancellationToken cancellationToken)
    {
        var stopwatch = Stopwatch.StartNew();
        _logger.LogInformation("Getting recommendations for job {JobId}", request.JobId);

        // Get job details
        var job = await _jobRepository.GetByIdAsync(request.JobId, cancellationToken);
        if (job == null)
            throw new NotFoundException($"Job {request.JobId} not found");

        // Get eligible contractors (matching job type, active status)
        var eligibleContractors = await _contractorRepository
            .GetByTypeAndStatusAsync(job.Type, ContractorStatus.Active, cancellationToken);

        _logger.LogInformation("Found {Count} eligible contractors", eligibleContractors.Count);

        // Score and rank contractors
        var rankedContractors = new List<RankedContractorDto>();

        foreach (var contractor in eligibleContractors)
        {
            // Check availability
            var availableSlots = await _availabilityService.GetAvailableTimeSlotsAsync(
                contractor.Id,
                job.DesiredDate.Date,
                job.Duration,
                cancellationToken);

            if (!availableSlots.Any())
                continue; // Skip contractors with no availability

            var earliestSlot = availableSlots.First();

            // Calculate distance
            var distance = await _distanceService.CalculateDistanceAsync(
                contractor.BaseLocation,
                job.Location,
                cancellationToken);

            // Calculate score
            var scoringDetails = _scoringService.CalculateScore(
                contractor,
                job,
                earliestSlot.StartTime,
                distance);

            var totalScore = scoringDetails.CalculateTotalScore();

            rankedContractors.Add(new RankedContractorDto
            {
                Contractor = _mapper.Map<ContractorDto>(contractor),
                Score = totalScore,
                ScoreBreakdown = _mapper.Map<ScoringDetailsDto>(scoringDetails),
                AvailableTimeSlots = availableSlots.Select(s => _mapper.Map<TimeSlotDto>(s)).ToList(),
                DistanceFromJob = distance,
                EstimatedTravelTime = await _distanceService.CalculateTravelTimeAsync(
                    contractor.BaseLocation,
                    job.Location,
                    cancellationToken)
            });
        }

        // Sort by score (descending) and take top N
        var topContractors = rankedContractors
            .OrderByDescending(c => c.Score)
            .Take(request.MaxResults)
            .ToList();

        stopwatch.Stop();
        _logger.LogInformation(
            "Recommendations generated in {ElapsedMs}ms: {Count} contractors ranked",
            stopwatch.ElapsedMilliseconds,
            topContractors.Count);

        return new RecommendationResponse
        {
            JobId = job.Id,
            JobDetails = _mapper.Map<JobDetailsDto>(job),
            Recommendations = topContractors,
            GeneratedAt = DateTime.UtcNow
        };
    }
}
```

### 5.2 MediatR Pipeline Behaviors

**Validation Behavior**
```csharp
namespace SmartScheduler.Application.Common.Behaviors;

public class ValidationBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : IRequest<TResponse>
{
    private readonly IEnumerable<IValidator<TRequest>> _validators;

    public ValidationBehavior(IEnumerable<IValidator<TRequest>> validators)
    {
        _validators = validators;
    }

    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken)
    {
        if (!_validators.Any())
            return await next();

        var context = new ValidationContext<TRequest>(request);

        var validationResults = await Task.WhenAll(
            _validators.Select(v => v.ValidateAsync(context, cancellationToken)));

        var failures = validationResults
            .SelectMany(r => r.Errors)
            .Where(f => f != null)
            .ToList();

        if (failures.Any())
            throw new ValidationException(failures);

        return await next();
    }
}
```

**Logging Behavior**
```csharp
namespace SmartScheduler.Application.Common.Behaviors;

public class LoggingBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : IRequest<TResponse>
{
    private readonly ILogger<LoggingBehavior<TRequest, TResponse>> _logger;

    public LoggingBehavior(ILogger<LoggingBehavior<TRequest, TResponse>> logger)
    {
        _logger = logger;
    }

    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken)
    {
        var requestName = typeof(TRequest).Name;

        _logger.LogInformation("Handling {RequestName}", requestName);

        var stopwatch = Stopwatch.StartNew();

        try
        {
            var response = await next();

            stopwatch.Stop();

            _logger.LogInformation(
                "Handled {RequestName} in {ElapsedMs}ms",
                requestName,
                stopwatch.ElapsedMilliseconds);

            return response;
        }
        catch (Exception ex)
        {
            stopwatch.Stop();

            _logger.LogError(
                ex,
                "Error handling {RequestName} after {ElapsedMs}ms",
                requestName,
                stopwatch.ElapsedMilliseconds);

            throw;
        }
    }
}
```

**Performance Behavior**
```csharp
namespace SmartScheduler.Application.Common.Behaviors;

public class PerformanceBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : IRequest<TResponse>
{
    private readonly ILogger<PerformanceBehavior<TRequest, TResponse>> _logger;
    private readonly Stopwatch _timer;

    public PerformanceBehavior(ILogger<PerformanceBehavior<TRequest, TResponse>> logger)
    {
        _logger = logger;
        _timer = new Stopwatch();
    }

    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken)
    {
        _timer.Start();

        var response = await next();

        _timer.Stop();

        var elapsedMilliseconds = _timer.ElapsedMilliseconds;

        if (elapsedMilliseconds > 500) // Threshold: 500ms
        {
            var requestName = typeof(TRequest).Name;

            _logger.LogWarning(
                "Long Running Request: {RequestName} ({ElapsedMs}ms) {@Request}",
                requestName,
                elapsedMilliseconds,
                request);
        }

        return response;
    }
}
```

---

## 6. Infrastructure Layer

### 6.1 Database Context

```csharp
namespace SmartScheduler.Infrastructure.Persistence;

public class ApplicationDbContext : DbContext
{
    public DbSet<Contractor> Contractors => Set<Contractor>();
    public DbSet<Job> Jobs => Set<Job>();
    public DbSet<Assignment> Assignments => Set<Assignment>();

    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        // Publish domain events before saving
        var domainEntities = ChangeTracker
            .Entries<BaseEntity>()
            .Where(x => x.Entity.DomainEvents.Any())
            .Select(x => x.Entity)
            .ToList();

        var domainEvents = domainEntities
            .SelectMany(x => x.DomainEvents)
            .ToList();

        domainEntities.ForEach(entity => entity.ClearDomainEvents());

        var result = await base.SaveChangesAsync(cancellationToken);

        // Publish events after successful save
        foreach (var domainEvent in domainEvents)
        {
            await PublishDomainEventAsync(domainEvent);
        }

        return result;
    }

    private async Task PublishDomainEventAsync(IDomainEvent domainEvent)
    {
        // Publish to message bus (SNS/SQS) and SignalR
        var eventBus = this.GetService<IEventBus>();
        await eventBus.PublishAsync(domainEvent);
    }
}
```

### 6.2 Entity Configurations

**Contractor Configuration**
```csharp
namespace SmartScheduler.Infrastructure.Persistence.Configurations;

public class ContractorConfiguration : IEntityTypeConfiguration<Contractor>
{
    public void Configure(EntityTypeBuilder<Contractor> builder)
    {
        builder.ToTable("Contractors");

        builder.HasKey(c => c.Id);

        builder.Property(c => c.Name)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(c => c.Type)
            .IsRequired()
            .HasConversion<int>();

        builder.Property(c => c.Rating)
            .IsRequired()
            .HasPrecision(3, 2);

        builder.Property(c => c.Status)
            .IsRequired()
            .HasConversion<int>();

        builder.Property(c => c.PhoneNumber)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(c => c.Email)
            .IsRequired()
            .HasMaxLength(255);

        // Value object: Location
        builder.OwnsOne(c => c.BaseLocation, location =>
        {
            location.Property(l => l.Latitude).HasPrecision(10, 7);
            location.Property(l => l.Longitude).HasPrecision(10, 7);
            location.Property(l => l.Address).HasMaxLength(255);
            location.Property(l => l.City).HasMaxLength(100);
            location.Property(l => l.State).HasMaxLength(2);
            location.Property(l => l.ZipCode).HasMaxLength(10);
        });

        // Value object collection: WorkingHours
        builder.OwnsMany(c => c.WorkingSchedule, workingHours =>
        {
            workingHours.WithOwner().HasForeignKey("ContractorId");
            workingHours.Property<int>("Id");
            workingHours.HasKey("Id");
            workingHours.Property(wh => wh.DayOfWeek).IsRequired();
            workingHours.Property(wh => wh.StartTime).IsRequired();
            workingHours.Property(wh => wh.EndTime).IsRequired();
            workingHours.ToTable("ContractorWorkingHours");
        });

        // Skills as JSON array
        builder.Property(c => c.Skills)
            .HasColumnType("jsonb");

        builder.Property(c => c.CreatedAt)
            .IsRequired();

        builder.Property(c => c.UpdatedAt)
            .IsRequired();

        // Indexes
        builder.HasIndex(c => c.Type);
        builder.HasIndex(c => c.Status);
        builder.HasIndex(c => c.Rating);
        builder.HasIndex(c => c.Email).IsUnique();
    }
}
```

### 6.3 Repository Implementation

```csharp
namespace SmartScheduler.Infrastructure.Persistence.Repositories;

public class ContractorRepository : IContractorRepository
{
    private readonly ApplicationDbContext _context;

    public ContractorRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Contractor?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Contractors
            .Include(c => c.Assignments)
            .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);
    }

    public async Task<List<Contractor>> GetByTypeAndStatusAsync(
        JobType jobType,
        ContractorStatus status,
        CancellationToken cancellationToken = default)
    {
        var contractorType = MapJobTypeToContractorType(jobType);

        return await _context.Contractors
            .Where(c => (c.Type == contractorType || c.Type == ContractorType.Multi) &&
                       c.Status == status)
            .ToListAsync(cancellationToken);
    }

    public async Task AddAsync(Contractor contractor, CancellationToken cancellationToken = default)
    {
        await _context.Contractors.AddAsync(contractor, cancellationToken);
    }

    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return await _context.SaveChangesAsync(cancellationToken);
    }

    private ContractorType MapJobTypeToContractorType(JobType jobType)
    {
        return jobType switch
        {
            JobType.Flooring => ContractorType.Flooring,
            JobType.Tile => ContractorType.Tile,
            JobType.Carpet => ContractorType.Carpet,
            _ => throw new ArgumentException($"Invalid job type: {jobType}")
        };
    }
}
```

---

**(Continuing in next response due to length...)**

This is an exceptionally detailed backend requirements document. I'll continue with the remaining sections in the next part. Would you like me to complete the backend document now, or shall I proceed to create the API Specification and Database Schema documents as well?

