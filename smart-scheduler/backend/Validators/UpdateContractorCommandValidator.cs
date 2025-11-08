using FluentValidation;
using SmartScheduler.Commands;
using SmartScheduler.Models;

namespace SmartScheduler.Validators;

public class UpdateContractorCommandValidator : AbstractValidator<UpdateContractorCommand>
{
    public UpdateContractorCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Contractor ID is required");

        RuleFor(x => x.Name)
            .MinimumLength(2).WithMessage("Name must be at least 2 characters")
            .MaximumLength(100).WithMessage("Name must not exceed 100 characters")
            .When(x => x.Name != null);

        RuleFor(x => x.Type)
            .IsInEnum().WithMessage("Type must be a valid contractor type")
            .When(x => x.Type.HasValue);

        RuleFor(x => x.PhoneNumber)
            .MaximumLength(20).WithMessage("Phone number must not exceed 20 characters")
            .When(x => x.PhoneNumber != null);

        RuleFor(x => x.Email)
            .EmailAddress().WithMessage("Email must be a valid email address")
            .MaximumLength(255).WithMessage("Email must not exceed 255 characters")
            .When(x => x.Email != null);

        RuleFor(x => x.BaseLocation)
            .SetValidator(new BaseLocationValidator()!)
            .When(x => x.BaseLocation != null);

        RuleForEach(x => x.WorkingHours)
            .SetValidator(new WorkingHoursValidator())
            .When(x => x.WorkingHours != null);
    }
}

public class BaseLocationValidator : AbstractValidator<BaseLocation>
{
    public BaseLocationValidator()
    {
        RuleFor(x => x.Latitude)
            .InclusiveBetween(-90m, 90m).WithMessage("Latitude must be between -90 and 90");

        RuleFor(x => x.Longitude)
            .InclusiveBetween(-180m, 180m).WithMessage("Longitude must be between -180 and 180");

        RuleFor(x => x.Address)
            .NotEmpty().WithMessage("Address is required")
            .MaximumLength(255).WithMessage("Address must not exceed 255 characters");

        RuleFor(x => x.City)
            .NotEmpty().WithMessage("City is required")
            .MaximumLength(100).WithMessage("City must not exceed 100 characters");

        RuleFor(x => x.State)
            .NotEmpty().WithMessage("State is required")
            .Length(2).WithMessage("State must be 2 characters");

        RuleFor(x => x.ZipCode)
            .NotEmpty().WithMessage("Zip code is required")
            .MaximumLength(10).WithMessage("Zip code must not exceed 10 characters");
    }
}

