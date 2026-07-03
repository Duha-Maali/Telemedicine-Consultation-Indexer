using AutoMapper;
using FluentValidation;
using TCI.Business.Abstractions.Messaging;
using TCI.Business.Abstractions.Storage;
using TCI.Business.Common.Errors;
using TCI.Business.Common.Extensions;
using TCI.Business.Common.Results;
using TCI.Business.DTOs.Consultations.Requests;
using TCI.Business.DTOs.Consultations.Responses;
using TCI.Business.Models.Messaging;
using TCI.Business.Services.Interfaces;
using TCI.DataAccess.Entities;
using TCI.DataAccess.Enums;
using TCI.DataAccess.Repositories.Interfaces;
using TCI.DataAccess.UnitOfWork;

namespace TCI.Business.Services.Implementations;

public sealed class ConsultationService(
    IConsultationRepository consultationRepository,
    IUnitOfWork unitOfWork,
    IFileStorageService fileStorageService,
    IConsultationMessagePublisher messagePublisher,
    IValidator<CreateConsultationRequest> createValidator,
    IMapper mapper) : IConsultationService
{
    private readonly IConsultationRepository _consultationRepository = consultationRepository;

    private readonly IUnitOfWork _unitOfWork = unitOfWork;

    private readonly IFileStorageService _fileStorageService = fileStorageService;

    private readonly IConsultationMessagePublisher _messagePublisher = messagePublisher;

    private readonly IValidator<CreateConsultationRequest> _createValidator = createValidator;

    private readonly IMapper _mapper = mapper;

    public async Task<Result<CreateConsultationResponse>> CreateAsync(
        Guid doctorId, 
        CreateConsultationRequest request, 
        CancellationToken cancellationToken = default)
    {
        var validationResult = await _createValidator.ValidateAsync(
            request,
            cancellationToken);

        if(!validationResult.IsValid)
        {
            return Result<CreateConsultationResponse>.Failure(validationResult.ToValidationError());
        }

        var storedFile = await _fileStorageService.SaveAsync(
            request.Video,
            cancellationToken);

        var consultation = new Consultation
        {
            Id = Guid.NewGuid(),
            DoctorId = doctorId,
            Title = request.Title,
            PatientName = request.PatientName,
            ConsultationDate = request.ConsultationDate,
            OriginalFileName = storedFile.OriginalFileName,
            FilePath = storedFile.FilePath,
            DurationSeconds = null,
            Status = ConsultationStatus.Pending,
            CreatedAt = DateTime.UtcNow,
            CompletedAt = null
        };

        try
        {
            await _consultationRepository.AddAsync(
                consultation,
                cancellationToken);

            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }
        catch
        {
            await TryDeleteStoredFileAsync(storedFile.FilePath);

            throw;
        }

        try
        {
            var message = new ProcessConsultationMessage(consultation.Id);

            await _messagePublisher.PublishProcessingRequestAsync(
                    message,
                    cancellationToken);
        }
        catch
        {
            return Result<CreateConsultationResponse>.Failure(ConsultationErrors.MessagePublishingFailed);
        }

        var response = _mapper.Map<CreateConsultationResponse>(consultation);

        return Result<CreateConsultationResponse>.Success(response);
    }

    public async Task<Result<IReadOnlyList<ConsultationListItemResponse>>> GetAllForDoctorAsync(
        Guid doctorId,
        CancellationToken cancellationToken = default)
    {
        var consultations = await _consultationRepository.GetAllForDoctorAsync(
            doctorId,
            cancellationToken);

        var response = _mapper.Map<IReadOnlyList<ConsultationListItemResponse>>(consultations);

        return Result<IReadOnlyList<ConsultationListItemResponse>>.Success(response);
    }

    public async Task<Result<ConsultationDetailsResponse>> GetByIdAsync(
        Guid consultationId,
        Guid doctorId, 
        CancellationToken cancellationToken = default)
    {
        var consultation = await _consultationRepository.GetByIdForDoctorAsync(
            consultationId,
            doctorId,
            cancellationToken);

        if (consultation is null)
        {
            return Result<ConsultationDetailsResponse>.Failure(ConsultationErrors.NotFound);
        }

        var response = _mapper.Map<ConsultationDetailsResponse>(consultation);

        return Result<ConsultationDetailsResponse>.Success(response);
    }

    public async Task<Result<ConsultationStatusResponse>> GetStatusAsync(
        Guid consultationId, 
        Guid doctorId, 
        CancellationToken cancellationToken = default)
    {
        var consultation = await _consultationRepository.GetByIdForDoctorAsync(
            consultationId,
            doctorId,
            cancellationToken);

        if (consultation is null)
        {
            return Result<ConsultationStatusResponse>.Failure(ConsultationErrors.NotFound);
        }

        var response = _mapper.Map<ConsultationStatusResponse>(consultation);

        return Result<ConsultationStatusResponse>.Success(response);
    }

    private async Task TryDeleteStoredFileAsync(string filePath)
    {
        try
        {
            await _fileStorageService.DeleteAsync(
                filePath,
                CancellationToken.None);
        }
        catch
        { 
        }
    }
}

