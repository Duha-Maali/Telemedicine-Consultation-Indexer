using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using System.Globalization;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.RateLimiting;
using TCI.Business;
using TCI.Business.Abstractions.Authentication;
using TCI.Business.TechnicalServices.Authentication;
using TCI.DataAccess;
using TCI.Presentation.Middleware;
using TCI.Presentation.Options;


var builder = WebApplication.CreateBuilder(args);
// Add services to the container.

builder.Logging.ClearProviders();

builder.Logging.AddConfiguration(builder.Configuration.GetSection("Logging"));

builder.Logging.AddJsonConsole(options =>
{
    options.IncludeScopes = true;
    options.TimestampFormat = "yyyy-MM-ddTHH:mm:ss.fffZ";
    options.UseUtcTimestamp = true;
});

builder.Services.Configure<RateLimitingOptions>(
    builder.Configuration.GetSection(RateLimitingOptions.SectionName));

var rateLimitingOptions = builder.Configuration
    .GetSection(RateLimitingOptions.SectionName)
    .Get<RateLimitingOptions>()
    ?? new RateLimitingOptions();

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(
            new JsonStringEnumConverter());
    }); ;

builder.Services.AddProblemDetails();

builder.Services.AddDataAccess(builder.Configuration);

builder.Services.AddBusinessLayer(builder.Configuration);

builder.Services.AddSingleton<IPasswordHasher, PasswordHasher>();

builder.Services.Configure<JwtSettings>(
    builder.Configuration.GetSection(JwtSettings.SectionName));

builder.Services.AddSingleton<ITokenGenerator, JwtTokenGenerator>();

var jwtSettings =
    builder.Configuration
        .GetSection(JwtSettings.SectionName)
        .Get<JwtSettings>()
    ?? throw new InvalidOperationException(
        "JWT settings are missing.");

if (string.IsNullOrWhiteSpace(jwtSettings.Key))
{
    throw new InvalidOperationException("JWT signing key is missing.");
}

if (string.IsNullOrWhiteSpace(jwtSettings.Issuer))
{
    throw new InvalidOperationException("JWT issuer is missing.");
}

if (string.IsNullOrWhiteSpace(jwtSettings.Audience))
{
    throw new InvalidOperationException("JWT audience is missing.");
}

if (jwtSettings.ExpirationMinutes <= 0)
{
    throw new InvalidOperationException("JWT expiration minutes must be greater than zero.");
}

builder.Services
    .AddAuthentication(
        JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters =
            new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidIssuer = jwtSettings.Issuer,

                ValidateAudience = true,
                ValidAudience = jwtSettings.Audience,

                ValidateIssuerSigningKey = true,
                IssuerSigningKey =
                    new SymmetricSecurityKey(
                        Encoding.UTF8.GetBytes(
                            jwtSettings.Key)),

                ValidateLifetime = true,

                ClockSkew = TimeSpan.Zero
            };
    });

builder.Services.AddAuthorization();

builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Telemedicine Consultation Indexer API",
        Version = "v1",
        Description = "API for uploading telemedicine consultations, processing transcripts, and searching consultation segments."
    });

    options.AddSecurityDefinition("bearer", new OpenApiSecurityScheme
    {
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        Description = "Enter the JWT token only. Do not write 'Bearer' before it."
    });

    options.AddSecurityRequirement(document => new OpenApiSecurityRequirement
    {
        [new OpenApiSecuritySchemeReference("bearer", document)] = []
    });
});

builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

    options.OnRejected = async (context, cancellationToken) =>
    {
        var retryAfterSeconds = 60;

        if (context.Lease.TryGetMetadata(MetadataName.RetryAfter, out var retryAfter))
        {
            retryAfterSeconds = Math.Max(1, (int)retryAfter.TotalSeconds);
        }

        context.HttpContext.Response.StatusCode = StatusCodes.Status429TooManyRequests;
        context.HttpContext.Response.Headers.RetryAfter =
            retryAfterSeconds.ToString(NumberFormatInfo.InvariantInfo);

        var logger = context.HttpContext.RequestServices
            .GetRequiredService<ILoggerFactory>()
            .CreateLogger("RateLimiting");

        var userId = context.HttpContext.User.FindFirst("doctorId")?.Value
            ?? context.HttpContext.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
            ?? "anonymous";

        logger.LogWarning(
            "Rate limit exceeded. Path={Path}, Method={Method}, UserId={UserId}, RemoteIp={RemoteIp}, RetryAfterSeconds={RetryAfterSeconds}",
            context.HttpContext.Request.Path,
            context.HttpContext.Request.Method,
            userId,
            context.HttpContext.Connection.RemoteIpAddress?.ToString(),
            retryAfterSeconds);

        context.HttpContext.Response.ContentType = "application/json";

        await context.HttpContext.Response.WriteAsync($$"""
        {
          "type": "https://telemedicine-indexer/errors/rate-limit-exceeded",
          "code": "RATE_LIMIT_EXCEEDED",
          "title": "Too many requests",
          "status": 429,
          "detail": "Rate limit exceeded. Please try again later.",
          "retryAfterSeconds": {{retryAfterSeconds}}
        }
        """, cancellationToken);
    };

    options.AddSlidingWindowLimiter("GeneralPolicy", limiterOptions =>
    {
        ConfigureSlidingWindowLimiter(limiterOptions, rateLimitingOptions.General);
    });

    options.AddSlidingWindowLimiter("AuthPolicy", limiterOptions =>
    {
        ConfigureSlidingWindowLimiter(limiterOptions, rateLimitingOptions.Auth);
    });

    options.AddSlidingWindowLimiter("UploadPolicy", limiterOptions =>
    {
        ConfigureSlidingWindowLimiter(limiterOptions, rateLimitingOptions.Upload);
    });

    options.AddSlidingWindowLimiter("SearchPolicy", limiterOptions =>
    {
        ConfigureSlidingWindowLimiter(limiterOptions, rateLimitingOptions.Search);
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();

    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint(
            "/swagger/v1/swagger.json",
            "Telemedicine Consultation Indexer API v1");

        options.RoutePrefix = "swagger";
    });
}

app.UseMiddleware<RequestLoggingMiddleware>();

app.UseMiddleware<ExceptionHandlingMiddleware>();

app.UseHttpsRedirection();

app.UseAuthentication();

app.UseAuthorization();

app.UseRateLimiter();

app.MapControllers();

app.Run();

static void ConfigureSlidingWindowLimiter(
    SlidingWindowRateLimiterOptions limiterOptions,
    RateLimitPolicyOptions policy)
{
    limiterOptions.PermitLimit = policy.PermitLimit;
    limiterOptions.Window = TimeSpan.FromMinutes(policy.WindowInMinutes);
    limiterOptions.SegmentsPerWindow = policy.SegmentsPerWindow;
    limiterOptions.QueueLimit = 0;
}