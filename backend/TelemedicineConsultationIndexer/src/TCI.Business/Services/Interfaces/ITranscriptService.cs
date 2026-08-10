using TCI.Business.Common.Results;
using TCI.Business.DTOs.Transcripts.Responses;

namespace TCI.Business.Services.Interfaces;

public interface ITranscriptService
{
    Task<Result<ConsultationTranscriptResponse>> GetByConsultationIdAsync(
            Guid doctorId,
            Guid consultationId,
            CancellationToken cancellationToken = default);

    Task<Result<IReadOnlyList<TranscriptSegmentResponse>>> SearchAsync(
        Guid doctorId,
        Guid consultationId,
        string query,
        CancellationToken cancellationToken = default);
}
