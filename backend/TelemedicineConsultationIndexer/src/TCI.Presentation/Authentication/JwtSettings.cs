using Microsoft.AspNetCore.Mvc.ModelBinding;
using System.Runtime.CompilerServices;

namespace TCI.Presentation.Authentication;

public sealed class JwtSettings
{
    public const string SectionName = "Jwt";

    public string Key { get; init; } = string.Empty;

    public string Issuer { get; init; } = string.Empty;

    public string Audience { get; init; } = string.Empty;

    public int ExpirationMinutes { get; init; }
}
