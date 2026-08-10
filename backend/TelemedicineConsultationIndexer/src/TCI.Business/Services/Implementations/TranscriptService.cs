using AutoMapper;
using Microsoft.Extensions.Logging;
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
    IMapper mapper,
    ILogger<TranscriptService> logger)
    : ITranscriptService
{
    private readonly IConsultationRepository _consultationRepository = consultationRepository;

    private readonly ITranscriptSegmentRepository  _transcriptSegmentRepository =  transcriptSegmentRepository;

    private readonly IMapper _mapper = mapper;

    private readonly ILogger<TranscriptService> _logger = logger;


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
            _logger.LogWarning(
                "Transcript requested for consultation {ConsultationId}, but the consultation was not found for doctor {DoctorId}.",
                consultationId,
                doctorId);

            return Result<ConsultationTranscriptResponse>.Failure(ConsultationErrors.NotFound);
        }

        if (consultation.Status != ConsultationStatus.Completed)
        {
            _logger.LogInformation(
                "Transcript requested for consultation {ConsultationId}, but transcript is not ready. CurrentStatus={Status}.",
                consultationId,
                consultation.Status);

            return Result<ConsultationTranscriptResponse>.Failure(ConsultationErrors.TranscriptNotReady);
        }

        var segments = await _transcriptSegmentRepository.GetByConsultationIdAsync(
            consultationId,
            cancellationToken);

        _logger.LogInformation(
            "Loaded transcript for consultation {ConsultationId}. SegmentCount={SegmentCount}.",
            consultationId,
            segments.Count);

        var response =
            new ConsultationTranscriptResponse
            {
                ConsultationId = consultationId,

                Segments = _mapper.Map<IReadOnlyList<TranscriptSegmentResponse>>(segments)
            };

        return Result<ConsultationTranscriptResponse>.Success(response);
    }

    public async Task<Result<IReadOnlyList<TranscriptSegmentResponse>>> SearchAsync(
        Guid doctorId,
        Guid consultationId,
        string query,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(query))
        {
            _logger.LogWarning(
                "Transcript search rejected for consultation {ConsultationId} because the search query is empty.",
                consultationId);

            return Result<IReadOnlyList<TranscriptSegmentResponse>>.Failure(ConsultationErrors.EmptySearchQuery);
        }

        var trimmedQuery = query.Trim();

        var consultation = await _consultationRepository.GetByIdForDoctorAsync(
                consultationId,
                doctorId,
                cancellationToken);

        if (consultation is null)
        {
            _logger.LogWarning(
                "Transcript search requested for consultation {ConsultationId}, but the consultation was not found for doctor {DoctorId}.",
                consultationId,
                doctorId);

            return Result<IReadOnlyList<TranscriptSegmentResponse>>.Failure(ConsultationErrors.NotFound);
        }

        if (consultation.Status != ConsultationStatus.Completed)
        {
            _logger.LogInformation(
               "Transcript search requested for consultation {ConsultationId}, but transcript is not ready. CurrentStatus={Status}.",
               consultationId,
               consultation.Status);

            return Result<IReadOnlyList<TranscriptSegmentResponse>>.Failure(ConsultationErrors.TranscriptNotReady);
        }

        var segments = await _transcriptSegmentRepository.SearchAsync(
                consultationId,
                trimmedQuery,
                cancellationToken);

        _logger.LogInformation(
            "Transcript search completed for consultation {ConsultationId}. QueryLength={QueryLength}, ResultCount={ResultCount}.",
            consultationId,
            trimmedQuery.Length,
            segments.Count);

        var response = segments
            .Select(segment =>
                new TranscriptSegmentResponse
                {
                    Id = segment.Id,
                    SequenceNumber = segment.SequenceNumber,
                    StartSeconds = segment.StartSeconds,
                    EndSeconds = segment.EndSeconds,
                    Text = segment.Text
                })
            .ToList();

        return Result<
            IReadOnlyList<TranscriptSegmentResponse>>.Success(response);
    }
}