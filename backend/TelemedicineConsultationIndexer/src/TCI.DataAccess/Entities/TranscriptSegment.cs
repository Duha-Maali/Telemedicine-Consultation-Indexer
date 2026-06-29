namespace TCI.DataAccess.Entities;

public class TranscriptSegment
{
    public Guid Id { get; set; }
    public Guid ConsultationId { get; set; }
    public int SequenceNumber { get; set; }
    public double StartSeconds { get; set; }
    public double EndSeconds { get; set; }
    public string Text { get; set; } = null!;
    public Consultation Consultation { get; set; } = null!;
}
