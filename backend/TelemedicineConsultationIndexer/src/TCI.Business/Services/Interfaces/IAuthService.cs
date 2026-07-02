using TCI.Business.Common.Results;
using TCI.Business.DTOs.Auth.Requests;
using TCI.Business.DTOs.Auth.Responses;

namespace TCI.Business.Services.Interfaces;

public interface IAuthService
{
    Task<Result<AuthResponse>> RegisterAsync(
        RegisterDoctorRequest request,
        CancellationToken cancellationToken = default);

    Task<Result<AuthResponse>> LoginAsync(
        LoginRequest request,
        CancellationToken cancellationToken = default);
}
