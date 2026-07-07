using TCI.DataAccess.Entities;

namespace TCI.DataAccess.Repositories.Interfaces;

public interface ITranscriptSegmentRepository
{
    Task<IReadOnlyList<TranscriptSegment>> GetByConsultationIdAsync(
    Guid consultationId,
    CancellationToken cancellationToken = default);

    Task<IReadOnlyList<TranscriptSegment>> SearchAsync(
        Guid consultationId,
        string query,
        CancellationToken cancellationToken = default);
}
