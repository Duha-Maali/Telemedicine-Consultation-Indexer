using AutoMapper;
using Microsoft.Extensions.Logging;
using TCI.Business.Common.Errors;
using TCI.Business.Common.Results;
using TCI.Business.DTOs.Doctors.Responses;
using TCI.Business.Services.Interfaces;
using TCI.DataAccess.Repositories.Interfaces;

namespace TCI.Business.Services.Implementations;

public sealed class DoctorService(
    IDoctorRepository doctorRepository,
    IMapper mapper,
    ILogger<DoctorService> logger) : IDoctorService
{
    private readonly IDoctorRepository _doctorRepository = doctorRepository;

    private readonly IMapper _mapper = mapper;

    private readonly ILogger<DoctorService> _logger = logger;
    public async Task<Result<DoctorResponse>> GetByIdAsync(
        Guid doctorId, 
        CancellationToken cancellationToken = default)
    {
        var doctor = await _doctorRepository.GetByIdAsync(
            doctorId, 
            cancellationToken);

        if (doctor is null)
        {
            _logger.LogWarning(
                "Doctor {DoctorId} was not found.",
                doctorId);

            return Result<DoctorResponse>.Failure(DoctorErrors.NotFound);
        }

        _logger.LogDebug(
            "Doctor {DoctorId} profile loaded.",
            doctorId);

        var response = _mapper.Map<DoctorResponse>(doctor);

        return Result<DoctorResponse>.Success(response);
    }
}
