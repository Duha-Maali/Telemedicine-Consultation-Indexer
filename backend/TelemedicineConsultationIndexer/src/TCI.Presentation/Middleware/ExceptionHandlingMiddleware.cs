using Microsoft.AspNetCore.Mvc;

namespace TCI.Presentation.Middleware;

public sealed class ExceptionHandlingMiddleware
{
    private const string CorrelationIdHeaderName = "X-Correlation-Id";

    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;
    private readonly IHostEnvironment _environment;

    public ExceptionHandlingMiddleware(
        RequestDelegate next,
        ILogger<ExceptionHandlingMiddleware> logger,
        IHostEnvironment environment)
    {
        ArgumentNullException.ThrowIfNull(next);
        ArgumentNullException.ThrowIfNull(logger);
        ArgumentNullException.ThrowIfNull(environment);

        _next = next;
        _logger = logger;
        _environment = environment;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        ArgumentNullException.ThrowIfNull(context);

        try
        {
            await _next(context);
        }
        catch (Exception exception)
        {
            await HandleExceptionAsync(
                context,
                exception);
        }
    }

    private async Task HandleExceptionAsync(
        HttpContext context,
        Exception exception)
    {
        if (context.Response.HasStarted)
        {
            _logger.LogWarning(
                exception,
                "An exception occurred after the response had already started.");

            throw exception;
        }

        var statusCode = exception switch
        {
            UnauthorizedAccessException => StatusCodes.Status401Unauthorized,
            _ => StatusCodes.Status500InternalServerError
        };

        _logger.LogError(
            exception,
            "Unhandled exception while processing HTTP {Method} {Path}. StatusCode={StatusCode}.",
            context.Request.Method,
            context.Request.Path,
            statusCode);

        var problem = new ProblemDetails
        {
            Status = statusCode,
            Title = statusCode == StatusCodes.Status401Unauthorized
                ? "Unauthorized"
                : "An unexpected error occurred.",
            Detail = _environment.IsDevelopment()
                ? exception.Message
                : null,
            Instance = context.Request.Path
        };

        problem.Extensions["traceId"] = context.TraceIdentifier;

        string? correlationIdValue = null;

        if (context.Response.Headers.TryGetValue(
                CorrelationIdHeaderName,
                out var correlationId))
        {
            correlationIdValue = correlationId.ToString();
            problem.Extensions["correlationId"] = correlationIdValue;
        }

        context.Response.Clear();
        context.Response.StatusCode = statusCode;
        context.Response.ContentType = "application/problem+json";

        if (!string.IsNullOrWhiteSpace(correlationIdValue))
        {
            context.Response.Headers[CorrelationIdHeaderName] = correlationIdValue;
        }

        await context.Response.WriteAsJsonAsync(problem);
    }
}
