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

        return MapError<T>(
            controller,
            result.Error);
    }

    public static IActionResult ToActionResult(
        this ControllerBase controller,
        Result result)
    {
        if (result.IsSuccess)
        {
            return controller.NoContent();
        }

        return MapError(
            controller,
            result.Error);
    }

    private static ActionResult<T> MapError<T>(
        ControllerBase controller,
        Error error)
    {
        return error.Type switch
        {
            ErrorType.Validation =>
                controller.BadRequest(
                    CreateErrorResponse(error)),

            ErrorType.Unauthorized =>
                controller.Unauthorized(
                    CreateErrorResponse(error)),

            ErrorType.NotFound =>
                controller.NotFound(
                    CreateErrorResponse(error)),

            ErrorType.Conflict =>
                controller.Conflict(
                    CreateErrorResponse(error)),

            _ =>
                controller.StatusCode(
                    StatusCodes.Status500InternalServerError,
                    CreateErrorResponse(error))
        };
    }

    private static IActionResult MapError(
        ControllerBase controller,
        Error error)
    {
        return error.Type switch
        {
            ErrorType.Validation =>
                controller.BadRequest(
                    CreateErrorResponse(error)),

            ErrorType.Unauthorized =>
                controller.Unauthorized(
                    CreateErrorResponse(error)),

            ErrorType.NotFound =>
                controller.NotFound(
                    CreateErrorResponse(error)),

            ErrorType.Conflict =>
                controller.Conflict(
                    CreateErrorResponse(error)),

            _ =>
                controller.StatusCode(
                    StatusCodes.Status500InternalServerError,
                    CreateErrorResponse(error))
        };
    }

    private static object CreateErrorResponse(
        Error error)
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
