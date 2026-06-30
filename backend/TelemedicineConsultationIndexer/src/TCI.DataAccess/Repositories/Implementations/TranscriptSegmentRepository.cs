using Microsoft.EntityFrameworkCore;
using TCI.DataAccess.Entities;
using TCI.DataAccess.Persistence;
using TCI.DataAccess.Repositories.Interfaces;

namespace TCI.DataAccess.Repositories.Implementations;

public class TranscriptSegmentRepository(AppDbContext context) : ITranscriptSegmentRepository
{
    private readonly AppDbContext _context = context;
    
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
}
