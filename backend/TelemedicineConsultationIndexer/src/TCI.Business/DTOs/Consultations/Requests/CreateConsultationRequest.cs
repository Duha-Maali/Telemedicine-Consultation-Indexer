using TCI.Business.Models.Storage;

namespace TCI.Business.DTOs.Consultations.Requests;

public sealed class CreateConsultationRequest
{
    public string Title { get; init; } = string.Empty;

    public string PatientName { get; init; } = string.Empty;

    public DateTime ConsultationDate { get; init; }

    public required FileUpload Video { get; init; } 
}
