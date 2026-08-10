using TCI.DataAccess.Enums;

namespace TCI.Business.DTOs.Consultations.Responses;

public sealed class ConsultationStatusResponse
{
    public ConsultationStatus Status { get; init; }
    public DateTime? CompletedAt { get; init; }
}

