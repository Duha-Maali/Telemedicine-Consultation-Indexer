using TCI.DataAccess.Entities;

namespace TCI.DataAccess.Repositories.Interfaces;

public interface ITranscriptSegmentRepository
{
    Task AddRangeAsync(
        IEnumerable<TranscriptSegment> segments,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<TranscriptSegment>> GetByConsultationIdAsync(
        Guid consultationId,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<TranscriptSegment>> SearchAsync(
        Guid consultationId,
        string searchText,
        CancellationToken cancellationToken = default);

    Task DeleteByConsultationIdAsync(
        Guid consultationId,
        CancellationToken cancellationToken = default);
}
