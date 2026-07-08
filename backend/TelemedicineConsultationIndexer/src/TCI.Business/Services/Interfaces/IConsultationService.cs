using TCI.Business.Common.Results;
using TCI.Business.DTOs.Consultations.Requests;
using TCI.Business.DTOs.Consultations.Responses;

namespace TCI.Business.Services.Interfaces;

public interface IConsultationService
{
    Task<Result<CreateConsultationResponse>> CreateAsync(
        Guid doctorId,
        CreateConsultationRequest request,
        CancellationToken cancellationToken = default);

    Task<Result<IReadOnlyList<ConsultationListItemResponse>>> GetAllForDoctorAsync(
        Guid doctorId,
        CancellationToken cancellationToken = default);

    Task<Result<ConsultationDetailsResponse>> GetByIdAsync(
        Guid consultationId,
        Guid doctorId,
        CancellationToken cancellationToken = default);


    Task<Result<ConsultationStatusResponse>> GetStatusAsync(
        Guid consultationId,
        Guid doctorId,
        CancellationToken cancellationToken = default);

    Task<Result> DeleteAsync(
        Guid doctorId,
        Guid consultationId,
        CancellationToken cancellationToken = default);

    Task<Result<ConsultationVideoResponse>> GetVideoAsync(
        Guid doctorId,
        Guid consultationId,
        CancellationToken cancellationToken = default);
}
