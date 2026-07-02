using TCI.Business.Common.Results;
using TCI.Business.DTOs.Doctors.Responses;

namespace TCI.Business.Services.Interfaces;

public interface IDoctorService
{
    Task<Result<DoctorResponse>> GetByIdAsync(
        Guid doctorId,
        CancellationToken cancellationToken = default);
}
