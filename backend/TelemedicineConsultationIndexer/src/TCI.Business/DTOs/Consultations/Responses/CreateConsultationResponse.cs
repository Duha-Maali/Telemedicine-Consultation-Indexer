using TCI.DataAccess.Enums;

namespace TCI.Business.DTOs.Consultations.Responses;

public sealed class CreateConsultationResponse
{
    public Guid Id { get; init; }

    public string Title { get; init; } = string.Empty;

    public string PatientName { get; init; } = string.Empty;

    public DateTime ConsultationDate { get; init; }

    public ConsultationStatus Status { get; init; }

}
