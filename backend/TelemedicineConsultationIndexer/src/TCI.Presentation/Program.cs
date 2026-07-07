using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Text.Json.Serialization;
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

// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();

app.Run();
