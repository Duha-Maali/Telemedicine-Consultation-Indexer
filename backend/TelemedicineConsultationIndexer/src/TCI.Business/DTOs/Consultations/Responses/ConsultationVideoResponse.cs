namespace TCI.Business.DTOs.Consultations.Responses;

public sealed class ConsultationVideoResponse
{
    public required Stream Content { get; init; }

    public required string ContentType { get; init; }

}