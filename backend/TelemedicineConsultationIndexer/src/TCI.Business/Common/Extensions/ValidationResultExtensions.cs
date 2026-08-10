using FluentValidation.Results;
using TCI.Business.Common.Results;


namespace TCI.Business.Common.Extensions;

public static class ValidationResultExtensions
{
    public static ValidationError ToValidationError(
        this ValidationResult validationResult) 
    { 
        var errors = validationResult.Errors
            .GroupBy(error => error.PropertyName)
            .ToDictionary(
                group => group.Key,
                group => group
                .Select(error => error.ErrorMessage)
                .Distinct()
                .ToArray());

        return new ValidationError(errors);
    }
}
