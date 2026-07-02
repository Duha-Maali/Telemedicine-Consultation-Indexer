using AutoMapper;
using TCI.Business.Common.Errors;
using TCI.Business.Common.Results;
using TCI.Business.DTOs.Doctors.Responses;
using TCI.Business.Services.Interfaces;
using TCI.DataAccess.Repositories.Interfaces;

namespace TCI.Business.Services.Implementations;

public sealed class DoctorService(
    IDoctorRepository doctorRepository,
    IMapper mapper) : IDoctorService
{
    private readonly IDoctorRepository _doctorRepository = doctorRepository;

    private readonly IMapper _mapper = mapper;
    public async Task<Result<DoctorResponse>> GetByIdAsync(
        Guid doctorId, 
        CancellationToken cancellationToken = default)
    {
        var doctor = await _doctorRepository.GetByIdAsync(
            doctorId, 
            cancellationToken);

        if (doctor is null)
        {
            return Result<DoctorResponse>.Failure(DoctorErrors.NotFound);
        }

        var response = _mapper.Map<DoctorResponse>(doctor);

        return Result<DoctorResponse>.Success(response);
    }
}
