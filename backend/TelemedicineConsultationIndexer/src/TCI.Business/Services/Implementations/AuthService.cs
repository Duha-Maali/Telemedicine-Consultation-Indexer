using AutoMapper;
using FluentValidation;
using Microsoft.Extensions.Logging;
using TCI.Business.Abstractions.Authentication;
using TCI.Business.Common.Errors;
using TCI.Business.Common.Extensions;
using TCI.Business.Common.Results;
using TCI.Business.DTOs.Auth.Requests;
using TCI.Business.DTOs.Auth.Responses;
using TCI.Business.Services.Interfaces;
using TCI.DataAccess.Entities;
using TCI.DataAccess.Repositories.Interfaces;
using TCI.DataAccess.UnitOfWork;

namespace TCI.Business.Services.Implementations;

public sealed class AuthService(
    IDoctorRepository doctorRepository,
    IUnitOfWork unitOfWork,
    IPasswordHasher passwordHasher,
    ITokenGenerator tokenGenerator,
    IValidator<RegisterDoctorRequest> registerValidator,
    IValidator<LoginRequest> loginValidator,
    IMapper mapper,
    ILogger<AuthService> logger) 
    : IAuthService
{
    private readonly IDoctorRepository _doctorRepository = doctorRepository;

    private readonly IUnitOfWork _unitOfWork = unitOfWork;

    private readonly IPasswordHasher _passwordHasher = passwordHasher;

    private readonly ITokenGenerator _tokenGenerator = tokenGenerator;

    private readonly IValidator<RegisterDoctorRequest> _registerValidator = registerValidator;

    private readonly IValidator<LoginRequest> _loginValidator = loginValidator;

    private readonly IMapper _mapper = mapper;

    private readonly ILogger<AuthService> _logger = logger;

    public async Task<Result<AuthResponse>> RegisterAsync(
        RegisterDoctorRequest request, 
        CancellationToken cancellationToken = default)
    {
        var validationResult =
            await _registerValidator.ValidateAsync(
                request,
                cancellationToken);

        if (!validationResult.IsValid)
        {
            _logger.LogWarning(
                "Doctor registration rejected because the request is invalid. ErrorCount={ErrorCount}.",
                validationResult.Errors.Count);

            return Result<AuthResponse>.Failure(
                validationResult.ToValidationError());
        }

        var emailExists = 
            await _doctorRepository.EmailExistsAsync(
                request.Email,
                cancellationToken);

        if(emailExists) 
        {
            _logger.LogWarning(
                "Doctor registration rejected because the email already exists.");

            return Result<AuthResponse>.Failure(
                AuthErrors.EmailAlreadyExists);
        }

        var doctor = new Doctor
        {
            Id = Guid.NewGuid(),
            FirstName = request.FirstName,
            LastName = request.LastName,
            Email = request.Email,
            PasswordHash = _passwordHasher.Hash
            (request.Password),
            CreatedAt = DateTime.UtcNow
        };

        await _doctorRepository.AddAsync(
            doctor,
            cancellationToken);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Doctor {DoctorId} registered successfully.",
            doctor.Id);

        var tokenResult = _tokenGenerator.Generate(doctor);

        var doctorResponse = _mapper.Map<DoctorAuthResponse>(doctor);

        var authResponse = new AuthResponse
        {
            AccessToken = tokenResult.AccessToken,
            ExpiresAt = tokenResult.ExpiresAt,
            Doctor = doctorResponse
        };

        return Result<AuthResponse>.Success(authResponse);
    }

    public async Task<Result<AuthResponse>> LoginAsync(
        LoginRequest request, 
        CancellationToken cancellationToken = default)
    {
        var validationResult = await _loginValidator.ValidateAsync(
            request, 
            cancellationToken);

        if (!validationResult.IsValid)
        {
            _logger.LogWarning(
                "Doctor login rejected because the request is invalid. ErrorCount={ErrorCount}.",
                validationResult.Errors.Count);

            return Result<AuthResponse>.Failure(
                validationResult.ToValidationError());
        }

        var doctor = await _doctorRepository.GetByEmailAsync(
            request.Email,
            cancellationToken);

        if (doctor is null)
        {
            _logger.LogWarning(
                "Doctor login failed because the credentials are invalid.");

            return Result<AuthResponse>.Failure(
                AuthErrors.InvalidCredentials);
        }

        var passwordIsValid = _passwordHasher.Verify(
            request.Password,
            doctor.PasswordHash);

        if (!passwordIsValid)
        {
            _logger.LogWarning(
               "Doctor {DoctorId} login failed because the credentials are invalid.",
               doctor.Id);

            return Result<AuthResponse>.Failure(
                AuthErrors.InvalidCredentials);
        }

        _logger.LogInformation(
           "Doctor {DoctorId} logged in successfully.",
           doctor.Id);

        var tokenResult = _tokenGenerator.Generate(doctor);

        var doctorResponse = _mapper.Map<DoctorAuthResponse>(doctor);

        var authResponse = new AuthResponse
        {
            AccessToken = tokenResult.AccessToken,
            ExpiresAt = tokenResult.ExpiresAt,
            Doctor = doctorResponse
        };

        return Result<AuthResponse>.Success(authResponse);
    }
}
