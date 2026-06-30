using TCI.DataAccess.Entities;

namespace TCI.DataAccess.Repositories.Interfaces;

public interface ITranscriptSegmentRepository
{
    Task<IReadOnlyList<TranscriptSegment>> GetByConsultationIdAsync(
    Guid consultationId,
    CancellationToken cancellationToken = default);
}
