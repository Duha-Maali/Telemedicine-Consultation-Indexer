using Microsoft.EntityFrameworkCore;
using TCI.DataAccess.Entities;
using TCI.DataAccess.Persistence;
using TCI.DataAccess.Repositories.Interfaces;

namespace TCI.DataAccess.Repositories.Implementations;

public class TranscriptSegmentRepository(AppDbContext context) : ITranscriptSegmentRepository
{
    private readonly AppDbContext _context = context;
    public async Task AddRangeAsync(
        IEnumerable<TranscriptSegment> segments,
        CancellationToken cancellationToken = default)
    {
        await _context.TranscriptSegments.AddRangeAsync(segments, cancellationToken);
    }

    public async Task<IReadOnlyList<TranscriptSegment>> GetByConsultationIdAsync(
        Guid consultationId, 
        CancellationToken cancellationToken = default)
    {
        return await _context.TranscriptSegments
            .AsNoTracking()
            .Where(segment =>
                segment.ConsultationId == consultationId)
            .OrderBy(segment => segment.SequenceNumber)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<TranscriptSegment>> SearchAsync(
        Guid consultationId, 
        string searchText, 
        CancellationToken cancellationToken = default)
    {
        return await _context.TranscriptSegments
            .AsNoTracking()
            .Where(segment => 
                segment.ConsultationId == consultationId &&
                segment.Text.Contains(searchText))
            .OrderBy(segment => segment.SequenceNumber)
            .ToListAsync (cancellationToken);
    }

    public async Task DeleteByConsultationIdAsync(Guid consultationId, CancellationToken cancellationToken = default)
    {
        await _context.TranscriptSegments
            .Where(segment =>
                segment.ConsultationId == consultationId)
            .ExecuteDeleteAsync(cancellationToken);
    }
}
