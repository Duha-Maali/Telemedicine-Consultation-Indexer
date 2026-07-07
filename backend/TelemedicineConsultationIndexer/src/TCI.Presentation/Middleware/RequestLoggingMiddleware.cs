using System.Diagnostics;
using System.Security.Claims;

namespace TCI.Presentation.Middleware;

public sealed class RequestLoggingMiddleware
{
    private const string CorrelationIdHeaderName = "X-Correlation-ID";

    private readonly RequestDelegate _next;

    private readonly ILogger<RequestLoggingMiddleware> _logger;

    public RequestLoggingMiddleware(
        RequestDelegate next,
        ILogger<RequestLoggingMiddleware> logger)
    {
        ArgumentNullException.ThrowIfNull(next);
        ArgumentNullException.ThrowIfNull(logger);

        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        ArgumentNullException.ThrowIfNull(context);

        var correlationId = GetOrCreateCorrelationId(context);

        context.TraceIdentifier = correlationId;
        context.Response.Headers[CorrelationIdHeaderName] = correlationId;

        var doctorId = context.User.FindFirstValue(ClaimTypes.NameIdentifier);

        using var scope = _logger.BeginScope(
            new Dictionary<string, object?>
            {
                ["CorrelationId"] = correlationId,
                ["TraceId"] = context.TraceIdentifier,
                ["DoctorId"] = doctorId
            });

        if (context.Request.Path.StartsWithSegments("/swagger"))
        {
            await _next(context);
            return;
        }

        var stopwatch = Stopwatch.StartNew();

        await _next(context);

        stopwatch.Stop();

        var elapsedMilliseconds = stopwatch.ElapsedMilliseconds;
        var statusCode = context.Response.StatusCode;

        if (statusCode >= StatusCodes.Status500InternalServerError)
        {
            _logger.LogWarning(
                "HTTP {Method} {Path} responded {StatusCode} in {ElapsedMilliseconds} ms.",
                context.Request.Method,
                context.Request.Path,
                statusCode,
                elapsedMilliseconds);

            return;
        }

        _logger.LogInformation(
            "HTTP {Method} {Path} responded {StatusCode} in {ElapsedMilliseconds} ms.",
            context.Request.Method,
            context.Request.Path,
            statusCode,
            elapsedMilliseconds);
    }

    private static string GetOrCreateCorrelationId(HttpContext context)
    {
        if (context.Request.Headers.TryGetValue(
                CorrelationIdHeaderName,
                out var correlationId)
            && !string.IsNullOrWhiteSpace(correlationId))
        {
            return correlationId.ToString();
        }

        return Guid.NewGuid().ToString("N");
    }
}

