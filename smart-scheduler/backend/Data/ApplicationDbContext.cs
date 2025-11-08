using Microsoft.EntityFrameworkCore;
using SmartScheduler.Models;

namespace SmartScheduler.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<Contractor> Contractors { get; set; }
    public DbSet<ContractorWorkingHours> ContractorWorkingHours { get; set; }

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
                .HasDefaultValue("[]");
            
            entity.Property(e => e.CreatedAt)
                .HasColumnName("created_at")
                .IsRequired();
            
            entity.Property(e => e.UpdatedAt)
                .HasColumnName("updated_at")
                .IsRequired();
            
            // Optimistic concurrency control
            entity.Property(e => e.RowVersion)
                .HasColumnName("row_version")
                .IsRowVersion();
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
    }
}
