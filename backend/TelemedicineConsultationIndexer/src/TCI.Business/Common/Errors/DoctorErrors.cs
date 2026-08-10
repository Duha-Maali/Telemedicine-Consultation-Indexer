using TCI.Business.Common.Results;

namespace TCI.Business.Common.Errors;

public static class DoctorErrors
{
    public static readonly Error NotFound = new(
        "Doctor.NotFound",
        "The doctor account was not found.",
        ErrorType.NotFound);
}
