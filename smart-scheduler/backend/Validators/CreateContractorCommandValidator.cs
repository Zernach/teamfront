using FluentValidation;
using SmartScheduler.Commands;
using SmartScheduler.Models;

namespace SmartScheduler.Validators;

public class CreateContractorCommandValidator : AbstractValidator<CreateContractorCommand>
{
    public CreateContractorCommandValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Name is required")
            .MinimumLength(2).WithMessage("Name must be at least 2 characters")
            .MaximumLength(100).WithMessage("Name must not exceed 100 characters");

        RuleFor(x => x.Type)
            .IsInEnum().WithMessage("Type must be a valid contractor type");

        RuleFor(x => x.PhoneNumber)
            .NotEmpty().WithMessage("Phone number is required")
            .MaximumLength(20).WithMessage("Phone number must not exceed 20 characters");

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required")
            .EmailAddress().WithMessage("Email must be a valid email address")
            .MaximumLength(255).WithMessage("Email must not exceed 255 characters");

        RuleFor(x => x.BaseLocation)
            .NotNull().WithMessage("Base location is required");

        RuleFor(x => x.BaseLocation.Latitude)
            .InclusiveBetween(-90m, 90m).WithMessage("Latitude must be between -90 and 90");

        RuleFor(x => x.BaseLocation.Longitude)
            .InclusiveBetween(-180m, 180m).WithMessage("Longitude must be between -180 and 180");

        RuleFor(x => x.BaseLocation.Address)
            .NotEmpty().WithMessage("Address is required")
            .MaximumLength(255).WithMessage("Address must not exceed 255 characters");

        RuleFor(x => x.BaseLocation.City)
            .NotEmpty().WithMessage("City is required")
            .MaximumLength(100).WithMessage("City must not exceed 100 characters");

        RuleFor(x => x.BaseLocation.State)
            .NotEmpty().WithMessage("State is required")
            .Length(2).WithMessage("State must be 2 characters");

        RuleFor(x => x.BaseLocation.ZipCode)
            .NotEmpty().WithMessage("Zip code is required")
            .MaximumLength(10).WithMessage("Zip code must not exceed 10 characters");

        RuleForEach(x => x.WorkingHours)
            .SetValidator(new WorkingHoursValidator())
            .When(x => x.WorkingHours != null);
    }
}

public class WorkingHoursValidator : AbstractValidator<WorkingHours>
{
    public WorkingHoursValidator()
    {
        RuleFor(x => x.DayOfWeek)
            .InclusiveBetween(0, 6).WithMessage("Day of week must be between 0 (Sunday) and 6 (Saturday)");

        RuleFor(x => x.EndTime)
            .GreaterThan(x => x.StartTime).WithMessage("End time must be after start time");
    }
}

