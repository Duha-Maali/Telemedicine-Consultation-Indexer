namespace TCI.Business.DTOs.Transcripts.Responses;

public sealed class ConsultationTranscriptResponse
{
    public Guid ConsultationId { get; init; }

    public IReadOnlyList<TranscriptSegmentResponse> Segments
    {
        get;
        init;
    } = [];
}
