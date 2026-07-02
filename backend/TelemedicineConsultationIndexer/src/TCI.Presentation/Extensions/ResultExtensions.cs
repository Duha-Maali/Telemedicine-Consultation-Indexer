using Microsoft.AspNetCore.Mvc;
using TCI.Business.Common.Results;

namespace TCI.Presentation.Extensions;

public static class ResultExtensions
{
    public static ActionResult<T> ToActionResult<T>(
        this ControllerBase controller,
        Result<T> result)
    {
        if (result.IsSuccess)
        {
            return controller.Ok(result.Value);
        }

        return result.Error.Type switch
        {
            ErrorType.Validation =>
                controller.BadRequest(
                    CreateErrorResponse(result.Error)),

            ErrorType.Unauthorized =>
                controller.Unauthorized(
                    CreateErrorResponse(result.Error)),

            ErrorType.NotFound =>
                controller.NotFound(
                    CreateErrorResponse(result.Error)),

            ErrorType.Conflict =>
                controller.Conflict(
                    CreateErrorResponse(result.Error)),

            _ =>
                controller.StatusCode(
                    StatusCodes.Status500InternalServerError,
                    CreateErrorResponse(result.Error))
        };
    }

    private static object CreateErrorResponse(Error error)
    {
        if (error is ValidationError validationError)
        {
            return new
            {
                code = validationError.Code,
                message = validationError.Message,
                errors = validationError.Errors
            };
        }

        return new
        {
            code = error.Code,
            message = error.Message
        };
    }
}
