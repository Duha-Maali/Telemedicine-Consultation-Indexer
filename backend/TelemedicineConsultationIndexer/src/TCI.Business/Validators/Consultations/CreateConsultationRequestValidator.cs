using FluentValidation;
using FluentValidation.Validators;
using TCI.Business.DTOs.Consultations.Requests;

namespace TCI.Business.Validators.Consultations;

public sealed class CreateConsultationRequestValidator : 
    AbstractValidator<CreateConsultationRequest>
{
    private const long MaximumFileSize = 1024L * 1024L * 1024L; // 1 GB

    private static readonly string[] AllowedContentTypes =
    [
        "video/mp4",
        "video/webm",
        "video/quicktime",
        "video/x-matroska"
    ];

    private static readonly string[] AllowedExtensions =
    [
        ".mp4",
        ".webm",
        ".mov",
        ".mkv"
    ];

    public CreateConsultationRequestValidator()
    {
        RuleFor(request => request.Title)
            .NotEmpty()
            .WithMessage("Consultation Title is required.")
            .MaximumLength(50)
            .WithMessage("Consultation title must not exceed 50 characters.");

        RuleFor(request => request.PatientName)
            .NotEmpty()
            .WithMessage("Patient Name is required.")
            .MaximumLength(50)
            .WithMessage("Patient name must not exceed 50 characters.");

        RuleFor(request => request.ConsultationDate)
            .NotEmpty()
            .WithMessage("Consultation Date is required.");

        RuleFor(request => request.Video)
            .NotNull()
            .WithMessage("Consultation video is required.");

        When(request => request.Video is not null, () =>
        {
            RuleFor(request => request.Video.Length)
            .GreaterThan(0)
            .WithMessage("Consultation video cannot be empty.")
            .LessThanOrEqualTo(MaximumFileSize)
            .WithMessage("Consultation video must not exceed 1 GB.");

            RuleFor(request => request.Video.FileName)
            .NotEmpty()
            .WithMessage("The video file name is required.")
            .Must(HaveAllowedExtension)
            .WithMessage("Only MP4, WebM, MOV, and MKV videos are allowed.");

            RuleFor(request => request.Video.ContentType)
                .NotEmpty()
                .WithMessage("The video content type is required.")
                .Must(HaveAllowedContentType)
                .WithMessage("The provided video format is not supported.");

            RuleFor(request => request.Video.Content)
                .NotNull()
                .WithMessage("The video content is required.");
        });
    }

    private static bool HaveAllowedExtension(string fileName)
    {
        var extension = Path.GetExtension(fileName);

        return AllowedExtensions.Contains(
            extension,
            StringComparer.OrdinalIgnoreCase);
    }

    private static bool HaveAllowedContentType(string contentType)
    {
        return AllowedContentTypes.Contains(
            contentType,
            StringComparer.OrdinalIgnoreCase);
    }
}

