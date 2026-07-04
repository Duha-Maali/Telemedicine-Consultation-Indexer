namespace TCI.Business.DTOs.Transcripts.Responses;

public sealed class TranscriptSegmentResponse
{
    public Guid Id { get; init; }

    public int SequenceNumber { get; init; }

    public double StartSeconds { get; init; }

    public double EndSeconds { get; init; }

    public string Text { get; init; } = string.Empty;
}