using FluentValidation;
using TCI.Business.DTOs.Auth.Requests;

namespace TCI.Business.Validators.Auth;

public sealed class RegisterDoctorRequestValidator 
    : AbstractValidator<RegisterDoctorRequest>
{
    public RegisterDoctorRequestValidator()
    {
        RuleFor(request => request.FirstName)
            .NotEmpty()
            .WithMessage("First name is required.")
            .MaximumLength(25)
            .WithMessage("First name must not exceed 25 characters.");

        RuleFor(request => request.LastName)
            .NotEmpty()
            .WithMessage("Last name is required.")
            .MaximumLength(25)
            .WithMessage("Last name must not exceed 25 characters.");

        RuleFor(request => request.Email)
            .NotEmpty()
            .WithMessage("Email is required.")
            .EmailAddress()
            .WithMessage("Email format is invalid.")
            .MaximumLength(100)
            .WithMessage("Email must not exceed 100 characters.");

        RuleFor(request => request.Password)
            .NotEmpty()
            .WithMessage("Password is required.")
            .MinimumLength(12)
            .WithMessage("Password must contain at least 12 characters.")
            .MaximumLength(100)
            .WithMessage("Password must not exceed 100 characters.");
    }
}

