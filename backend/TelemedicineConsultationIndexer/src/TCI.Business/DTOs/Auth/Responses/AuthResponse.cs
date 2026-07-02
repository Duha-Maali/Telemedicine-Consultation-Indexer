namespace TCI.Business.DTOs.Auth.Responses;

public sealed class AuthResponse
{
    public string AccessToken { get; init; } = string.Empty;
    public DateTime ExpiresAt { get; init; }
    public required DoctorAuthResponse Doctor { get; init; }
}
