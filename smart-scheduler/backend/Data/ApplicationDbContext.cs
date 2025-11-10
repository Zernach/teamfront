using Microsoft.EntityFrameworkCore;
using SmartScheduler.Models;

namespace SmartScheduler.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<Contractor> Contractors { get; set; }
    public DbSet<ContractorWorkingHours> ContractorWorkingHours { get; set; }
    public DbSet<Job> Jobs { get; set; }
    public DbSet<Assignment> Assignments { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure Contractor entity
        modelBuilder.Entity<Contractor>(entity =>
        {
            entity.ToTable("contractors");
            
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id)
                .HasColumnName("id");
            
            entity.Property(e => e.Name)
                .HasColumnName("name")
                .HasMaxLength(100)
                .IsRequired();
            
            entity.Property(e => e.Type)
                .HasColumnName("type")
                .HasConversion<int>()
                .IsRequired();
            
            entity.Property(e => e.Rating)
                .HasColumnName("rating")
                .HasPrecision(3, 2)
                .HasDefaultValue(0.00m)
                .IsRequired();
            
            entity.Property(e => e.Status)
                .HasColumnName("status")
                .HasConversion<int>()
                .HasDefaultValue(ContractorStatus.Active)
                .HasSentinel((ContractorStatus)0)
                .IsRequired();
            
            entity.Property(e => e.PhoneNumber)
                .HasColumnName("phone_number")
                .HasMaxLength(20)
                .IsRequired();
            
            entity.Property(e => e.Email)
                .HasColumnName("email")
                .HasMaxLength(255)
                .IsRequired();
            
            entity.HasIndex(e => e.Email)
                .IsUnique();
            
            // Configure BaseLocation as owned entity
            entity.OwnsOne(e => e.BaseLocation, location =>
            {
                location.Property(l => l.Latitude)
                    .HasColumnName("base_location_latitude")
                    .HasPrecision(10, 7)
                    .IsRequired();
                
                location.Property(l => l.Longitude)
                    .HasColumnName("base_location_longitude")
                    .HasPrecision(10, 7)
                    .IsRequired();
                
                location.Property(l => l.Address)
                    .HasColumnName("base_location_address")
                    .HasMaxLength(255)
                    .IsRequired();
                
                location.Property(l => l.City)
                    .HasColumnName("base_location_city")
                    .HasMaxLength(100)
                    .IsRequired();
                
                location.Property(l => l.State)
                    .HasColumnName("base_location_state")
                    .HasMaxLength(2)
                    .IsRequired();
                
                location.Property(l => l.ZipCode)
                    .HasColumnName("base_location_zip_code")
                    .HasMaxLength(10)
                    .IsRequired();
            });
            
            // Configure Skills as JSONB
            entity.Property(e => e.Skills)
                .HasColumnName("skills")
                .HasColumnType("jsonb")
                .HasConversion(
                    v => System.Text.Json.JsonSerializer.Serialize(v, (System.Text.Json.JsonSerializerOptions?)null),
                    v => System.Text.Json.JsonSerializer.Deserialize<List<string>>(v, (System.Text.Json.JsonSerializerOptions?)null) ?? new List<string>()
                )
                .Metadata.SetValueComparer(
                    new Microsoft.EntityFrameworkCore.ChangeTracking.ValueComparer<List<string>>(
                        (c1, c2) => c1 != null && c2 != null && c1.SequenceEqual(c2),
                        c => c.Aggregate(0, (a, v) => HashCode.Combine(a, v.GetHashCode())),
                        c => c.ToList()
                    ));
            
            entity.Property(e => e.CreatedAt)
                .HasColumnName("created_at")
                .IsRequired();
            
            entity.Property(e => e.UpdatedAt)
                .HasColumnName("updated_at")
                .IsRequired();
            
            // Optimistic concurrency control
            // For PostgreSQL, use xmin for row versioning instead of a bytea column
            entity.Property(e => e.RowVersion)
                .HasColumnName("row_version")
                .IsRequired()
                .IsConcurrencyToken()
                .HasDefaultValueSql("'\\x00000000000000000000000000000000'::bytea")
                .ValueGeneratedOnAddOrUpdate();
        });

        // Configure ContractorWorkingHours entity
        modelBuilder.Entity<ContractorWorkingHours>(entity =>
        {
            entity.ToTable("contractor_working_hours");
            
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id)
                .HasColumnName("id")
                .ValueGeneratedOnAdd();
            
            entity.Property(e => e.ContractorId)
                .HasColumnName("contractor_id")
                .IsRequired();
            
            entity.HasOne(e => e.Contractor)
                .WithMany(c => c.WorkingHours)
                .HasForeignKey(e => e.ContractorId)
                .OnDelete(DeleteBehavior.Cascade);
            
            entity.Property(e => e.DayOfWeek)
                .HasColumnName("day_of_week")
                .IsRequired();
            
            entity.Property(e => e.StartTime)
                .HasColumnName("start_time")
                .HasConversion(
                    v => v.ToTimeSpan(),
                    v => TimeOnly.FromTimeSpan(v)
                )
                .IsRequired();
            
            entity.Property(e => e.EndTime)
                .HasColumnName("end_time")
                .HasConversion(
                    v => v.ToTimeSpan(),
                    v => TimeOnly.FromTimeSpan(v)
                )
                .IsRequired();
            
            entity.HasIndex(e => new { e.ContractorId, e.DayOfWeek });
        });

        // Configure Job entity
        modelBuilder.Entity<Job>(entity =>
        {
            entity.ToTable("jobs");
            
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id)
                .HasColumnName("id");
            
            entity.Property(e => e.JobNumber)
                .HasColumnName("job_number")
                .HasMaxLength(50)
                .IsRequired();
            
            entity.HasIndex(e => e.JobNumber)
                .IsUnique();
            
            entity.Property(e => e.Type)
                .HasColumnName("type")
                .HasConversion<int>()
                .IsRequired();
            
            entity.Property(e => e.Status)
                .HasColumnName("status")
                .HasConversion<int>()
                .HasDefaultValue(JobStatus.Open)
                .IsRequired();
            
            entity.Property(e => e.DesiredDate)
                .HasColumnName("desired_date")
                .IsRequired();
            
            entity.Property(e => e.Duration)
                .HasColumnName("duration")
                .IsRequired();
            
            entity.Property(e => e.Priority)
                .HasColumnName("priority")
                .HasConversion<int>()
                .HasDefaultValue(Priority.Medium)
                .IsRequired();
            
            // Configure Location as owned entity
            entity.OwnsOne(e => e.Location, location =>
            {
                location.Property(l => l.Latitude)
                    .HasColumnName("location_latitude")
                    .HasPrecision(10, 7)
                    .IsRequired();
                
                location.Property(l => l.Longitude)
                    .HasColumnName("location_longitude")
                    .HasPrecision(10, 7)
                    .IsRequired();
                
                location.Property(l => l.Address)
                    .HasColumnName("location_address")
                    .HasMaxLength(255)
                    .IsRequired();
                
                location.Property(l => l.City)
                    .HasColumnName("location_city")
                    .HasMaxLength(100)
                    .IsRequired();
                
                location.Property(l => l.State)
                    .HasColumnName("location_state")
                    .HasMaxLength(2)
                    .IsRequired();
                
                location.Property(l => l.ZipCode)
                    .HasColumnName("location_zip_code")
                    .HasMaxLength(10)
                    .IsRequired();
            });
            
            // Configure SpecialRequirements as JSONB
            entity.Property(e => e.SpecialRequirements)
                .HasColumnName("special_requirements")
                .HasColumnType("jsonb")
                .HasConversion(
                    v => System.Text.Json.JsonSerializer.Serialize(v, (System.Text.Json.JsonSerializerOptions?)null),
                    v => System.Text.Json.JsonSerializer.Deserialize<List<string>>(v, (System.Text.Json.JsonSerializerOptions?)null) ?? new List<string>()
                )
                .Metadata.SetValueComparer(
                    new Microsoft.EntityFrameworkCore.ChangeTracking.ValueComparer<List<string>>(
                        (c1, c2) => c1 != null && c2 != null && c1.SequenceEqual(c2),
                        c => c.Aggregate(0, (a, v) => HashCode.Combine(a, v.GetHashCode())),
                        c => c.ToList()
                    ));
            
            entity.Property(e => e.AssignedContractorId)
                .HasColumnName("assigned_contractor_id");
            
            entity.HasOne(e => e.AssignedContractor)
                .WithMany()
                .HasForeignKey(e => e.AssignedContractorId)
                .OnDelete(DeleteBehavior.SetNull);
            
            entity.HasOne(e => e.Assignment)
                .WithOne(a => a.Job)
                .HasForeignKey<Assignment>(a => a.JobId)
                .OnDelete(DeleteBehavior.Cascade);
            
            entity.Property(e => e.CreatedAt)
                .HasColumnName("created_at")
                .IsRequired();
            
            entity.Property(e => e.UpdatedAt)
                .HasColumnName("updated_at")
                .IsRequired();
            
            entity.Property(e => e.RowVersion)
                .HasColumnName("row_version")
                .IsRequired()
                .IsConcurrencyToken()
                .HasDefaultValueSql("'\\x00000000000000000000000000000000'::bytea")
                .ValueGeneratedOnAddOrUpdate();
            
            // Indexes
            entity.HasIndex(e => e.Status);
            entity.HasIndex(e => e.Type);
            entity.HasIndex(e => e.DesiredDate);
            entity.HasIndex(e => e.Priority);
            entity.HasIndex(e => e.AssignedContractorId);
        });

        // Configure Assignment entity
        modelBuilder.Entity<Assignment>(entity =>
        {
            entity.ToTable("assignments");
            
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id)
                .HasColumnName("id");
            
            entity.Property(e => e.JobId)
                .HasColumnName("job_id")
                .IsRequired();
            
            entity.Property(e => e.ContractorId)
                .HasColumnName("contractor_id")
                .IsRequired();
            
            entity.Property(e => e.Status)
                .HasColumnName("status")
                .HasConversion<int>()
                .HasDefaultValue(AssignmentStatus.Pending)
                .IsRequired();
            
            entity.Property(e => e.Score)
                .HasColumnName("score")
                .HasPrecision(5, 4)
                .IsRequired();
            
            entity.Property(e => e.ScheduledStartTime)
                .HasColumnName("scheduled_start_time")
                .IsRequired();
            
            entity.Property(e => e.ScheduledEndTime)
                .HasColumnName("scheduled_end_time")
                .IsRequired();
            
            entity.Property(e => e.ScheduledDuration)
                .HasColumnName("scheduled_duration")
                .IsRequired();
            
            // Score breakdown properties
            entity.Property(e => e.ScoreAvailabilityScore)
                .HasColumnName("score_availability_score")
                .HasPrecision(5, 4)
                .IsRequired();
            
            entity.Property(e => e.ScoreRatingScore)
                .HasColumnName("score_rating_score")
                .HasPrecision(5, 4)
                .IsRequired();
            
            entity.Property(e => e.ScoreDistanceScore)
                .HasColumnName("score_distance_score")
                .HasPrecision(5, 4)
                .IsRequired();
            
            entity.Property(e => e.ScoreAvailabilityWeight)
                .HasColumnName("score_availability_weight")
                .HasPrecision(3, 2)
                .IsRequired();
            
            entity.Property(e => e.ScoreRatingWeight)
                .HasColumnName("score_rating_weight")
                .HasPrecision(3, 2)
                .IsRequired();
            
            entity.Property(e => e.ScoreDistanceWeight)
                .HasColumnName("score_distance_weight")
                .HasPrecision(3, 2)
                .IsRequired();
            
            entity.Property(e => e.ScoreExplanation)
                .HasColumnName("score_explanation")
                .HasMaxLength(1000);
            
            entity.Property(e => e.ConfirmedAt)
                .HasColumnName("confirmed_at");
            
            entity.Property(e => e.StartedAt)
                .HasColumnName("started_at");
            
            entity.Property(e => e.CompletedAt)
                .HasColumnName("completed_at");
            
            entity.Property(e => e.CancellationReason)
                .HasColumnName("cancellation_reason")
                .HasMaxLength(500);
            
            entity.Property(e => e.CreatedAt)
                .HasColumnName("created_at")
                .IsRequired();
            
            entity.Property(e => e.UpdatedAt)
                .HasColumnName("updated_at")
                .IsRequired();
            
            entity.HasOne(e => e.Job)
                .WithOne(j => j.Assignment)
                .HasForeignKey<Assignment>(e => e.JobId)
                .OnDelete(DeleteBehavior.Cascade);
            
            entity.HasOne(e => e.Contractor)
                .WithMany()
                .HasForeignKey(e => e.ContractorId)
                .OnDelete(DeleteBehavior.Restrict);
            
            // Unique constraint: one assignment per job
            entity.HasIndex(e => e.JobId)
                .IsUnique();
            
            // Indexes
            entity.HasIndex(e => e.ContractorId);
            entity.HasIndex(e => e.Status);
            entity.HasIndex(e => e.ScheduledStartTime);
        });

        // Configure User entity
        modelBuilder.Entity<User>(entity =>
        {
            entity.ToTable("users");
            
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id)
                .HasColumnName("id");
            
            entity.Property(e => e.Username)
                .HasColumnName("username")
                .HasMaxLength(50)
                .IsRequired();
            
            entity.HasIndex(e => e.Username)
                .IsUnique();
            
            entity.Property(e => e.Email)
                .HasColumnName("email")
                .HasMaxLength(255)
                .IsRequired();
            
            entity.HasIndex(e => e.Email)
                .IsUnique();
            
            entity.Property(e => e.PasswordHash)
                .HasColumnName("password_hash")
                .HasMaxLength(255)
                .IsRequired();
            
            entity.Property(e => e.CreatedAt)
                .HasColumnName("created_at")
                .IsRequired();
            
            entity.Property(e => e.UpdatedAt)
                .HasColumnName("updated_at")
                .IsRequired();
        });
    }
}
