using TCI.DataAccess.Enums;

namespace TCI.DataAccess.Entities;

public class Consultation
{
    public Guid Id { get; set; }
    public Guid DoctorId { get; set; }
    public string Title { get; set; } = null!;
    public string PatientName { get; set; } = null!;
    public DateTime ConsultationDate { get; set; }
    public string OriginalFileName { get; set; } = null!;
    public string FilePath { get; set; } = null!;
    public double? DurationSeconds { get; set; }
    public ConsultationStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public Doctor Doctor { get; set; } = null!;
    public ICollection<TranscriptSegment> TranscriptSegments { get; set; } = new List<TranscriptSegment>();

}
