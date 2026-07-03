using TCI.DataAccess.Enums;

namespace TCI.Business.DTOs.Consultations.Responses;

public sealed class ConsultationDetailsResponse
{
    public Guid Id { get; init; }

    public string Title { get; init; } = string.Empty;

    public string PatientName { get; init; } = string.Empty;

    public DateTime ConsultationDate { get; init; }

    public string OriginalFileName { get; init; } = string.Empty;

    public double? DurationSeconds { get; init; }

    public ConsultationStatus Status { get; init; }

    public DateTime CreatedAt { get; init; }

    public DateTime? CompletedAt { get; init; }
}
