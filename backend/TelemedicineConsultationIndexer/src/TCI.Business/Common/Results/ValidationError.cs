namespace TCI.Business.Common.Results;

public sealed record ValidationError(
    IReadOnlyDictionary<string, string[]> Errors)
    : Error(
        "Validation.Failed",
        "One or more validation errors occurred.",
        ErrorType.Validation);
