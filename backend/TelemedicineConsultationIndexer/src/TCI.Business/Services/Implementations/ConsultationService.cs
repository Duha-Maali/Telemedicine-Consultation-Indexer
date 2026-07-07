using AutoMapper;
using FluentValidation;
using Microsoft.Extensions.Logging;
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
    IMapper mapper,
    ILogger<ConsultationService> logger) : IConsultationService
{
    private readonly IConsultationRepository _consultationRepository = consultationRepository;

    private readonly IUnitOfWork _unitOfWork = unitOfWork;

    private readonly IFileStorageService _fileStorageService = fileStorageService;

    private readonly IConsultationMessagePublisher _messagePublisher = messagePublisher;

    private readonly IValidator<CreateConsultationRequest> _createValidator = createValidator;

    private readonly IMapper _mapper = mapper;

    private readonly ILogger<ConsultationService> _logger = logger;

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
            _logger.LogWarning(
                "Consultation creation rejected for doctor {DoctorId}. ErrorCount={ErrorCount}.",
                doctorId,
                validationResult.Errors.Count);

            return Result<CreateConsultationResponse>.Failure(validationResult.ToValidationError());
        }

        _logger.LogInformation(
            "Creating consultation upload for doctor {DoctorId}. FileLength={FileLength} bytes, ContentType={ContentType}.",
            doctorId,
            request.Video.Length,
            request.Video.ContentType);

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
        catch(Exception exception)
        {
            _logger.LogError(
               exception,
               "Failed to save consultation metadata for doctor {DoctorId}. StoredFilePath={StoredFilePath}.",
               doctorId,
               storedFile.FilePath);

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
        catch(Exception exception)
        {
            _logger.LogError(
               exception,
               "Failed to publish processing request for consultation {ConsultationId}.",
               consultation.Id);

            return Result<CreateConsultationResponse>.Failure(ConsultationErrors.MessagePublishingFailed);
        }

        _logger.LogInformation(
            "Consultation {ConsultationId} created and queued for processing.",
            consultation.Id);

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

        _logger.LogDebug(
            "Loaded consultations for doctor {DoctorId}. Count={Count}.",
            doctorId,
            consultations.Count);

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
            _logger.LogWarning(
                "Consultation {ConsultationId} was not found for doctor {DoctorId}.",
                consultationId,
                doctorId);

            return Result<ConsultationDetailsResponse>.Failure(ConsultationErrors.NotFound);
        }

        _logger.LogDebug(
            "Loaded consultation {ConsultationId} for doctor {DoctorId}. Status={Status}.",
            consultationId,
            doctorId,
            consultation.Status); 

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
            _logger.LogWarning(
                "Consultation status requested, but consultation {ConsultationId} was not found for doctor {DoctorId}.",
                consultationId,
                doctorId);

            return Result<ConsultationStatusResponse>.Failure(ConsultationErrors.NotFound);
        }

        _logger.LogDebug(
            "Consultation {ConsultationId} status checked. Status={Status}.",
            consultationId,
            consultation.Status);

        var response = _mapper.Map<ConsultationStatusResponse>(consultation);

        return Result<ConsultationStatusResponse>.Success(response);
    }

    public async Task<Result> DeleteAsync(
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
                "Consultation {ConsultationId} delete requested, but it was not found for doctor {DoctorId}.",
                consultationId,
                doctorId);

            return Result.Failure(ConsultationErrors.NotFound);
        }

        if (consultation.Status == ConsultationStatus.Processing)
        {
            _logger.LogWarning(
                "Consultation {ConsultationId} delete rejected because it is currently processing.",
                consultationId);

            return Result.Failure(ConsultationErrors.CannotDeleteWhileProcessing);
        }

        var storedFilePath = consultation.FilePath;

        _consultationRepository.Delete(consultation);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        await TryDeleteStoredFileAsync(storedFilePath);

        _logger.LogInformation(
            "Consultation {ConsultationId} deleted successfully by doctor {DoctorId}.",
            consultationId,
            doctorId);

        return Result.Success();
    }

    private async Task TryDeleteStoredFileAsync(string filePath)
    {
        try
        {
            await _fileStorageService.DeleteAsync(
                filePath,
                CancellationToken.None);
        }
        catch (Exception exception)
        {
            _logger.LogWarning(
                exception,
                "Failed to delete stored consultation file {FilePath}.",
                filePath);
        }
    }
}

