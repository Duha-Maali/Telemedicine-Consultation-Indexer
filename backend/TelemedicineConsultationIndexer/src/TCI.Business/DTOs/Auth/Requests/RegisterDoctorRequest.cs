namespace TCI.Business.DTOs.Auth.Requests;

public sealed class RegisterDoctorRequest
{ 
    public string FirstName { get; init; } = string.Empty;
    public string LastName { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
    public string Password { get; init; } = string.Empty;

}
