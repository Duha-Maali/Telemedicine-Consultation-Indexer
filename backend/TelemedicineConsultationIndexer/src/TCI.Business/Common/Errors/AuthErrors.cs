using TCI.Business.Common.Results;

namespace TCI.Business.Common.Errors;

public static class AuthErrors
{
    public static readonly Error EmailAlreadyExists = new(
        "Auth.EmailAlreadyExists",
        "An account with this email is already exists.",
        ErrorType.Conflict);

    public static readonly Error InvalidCredentials = new(
        "Auth.InvalidCredentials",
        "The email or password is incorrect.",
        ErrorType.Unauthorized);

}
