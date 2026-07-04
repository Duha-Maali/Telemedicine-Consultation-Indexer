using AutoMapper;
using TCI.Business.Common.Errors;
using TCI.Business.Common.Results;
using TCI.Business.DTOs.Transcripts.Responses;
using TCI.Business.Services.Interfaces;
using TCI.DataAccess.Enums;
using TCI.DataAccess.Repositories.Interfaces;

namespace TCI.Business.Services.Implementations;

public sealed class TranscriptService(
    IConsultationRepository consultationRepository,
    ITranscriptSegmentRepository transcriptSegmentRepository,
    IMapper mapper)
    : ITranscriptService
{
    private readonly IConsultationRepository _consultationRepository = consultationRepository;

    private readonly ITranscriptSegmentRepository  _transcriptSegmentRepository =  transcriptSegmentRepository;

    private readonly IMapper _mapper = mapper;

    public async Task<Result<ConsultationTranscriptResponse>> GetByConsultationIdAsync(
            Guid doctorId,
            Guid consultationId,
            CancellationToken cancellationToken = default)
    {
        var consultation = await _consultationRepository.GetByIdForDoctorAsync(
            consultationId,
            doctorId,
            cancellationToken);

        if (consultation is null)
        {
            return Result<ConsultationTranscriptResponse>.Failure(ConsultationErrors.NotFound);
        }

        if (consultation.Status != ConsultationStatus.Completed)
        {
            return Result<ConsultationTranscriptResponse>.Failure(ConsultationErrors.TranscriptNotReady);
        }

        var segments = await _transcriptSegmentRepository.GetByConsultationIdAsync(
            consultationId,
            cancellationToken);

        var response =
            new ConsultationTranscriptResponse
            {
                ConsultationId = consultationId,

                Segments = _mapper.Map<IReadOnlyList<TranscriptSegmentResponse>>(segments)
            };

        return Result<ConsultationTranscriptResponse>.Success(response);
    }
}