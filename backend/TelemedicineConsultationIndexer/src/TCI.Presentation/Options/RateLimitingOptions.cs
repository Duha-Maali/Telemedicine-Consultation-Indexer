namespace TCI.Presentation.Options;

public sealed class RateLimitingOptions
{
    public const string SectionName = "RateLimiting";

    public RateLimitPolicyOptions General { get; init; } = new()
    {
        PermitLimit = 100,
        WindowInMinutes = 1,
        SegmentsPerWindow = 4
    };

    public RateLimitPolicyOptions Auth { get; init; } = new()
    {
        PermitLimit = 5,
        WindowInMinutes = 1,
        SegmentsPerWindow = 4
    };

    public RateLimitPolicyOptions Upload { get; init; } = new()
    {
        PermitLimit = 5,
        WindowInMinutes = 10,
        SegmentsPerWindow = 5
    };

    public RateLimitPolicyOptions Search { get; init; } = new()
    {
        PermitLimit = 30,
        WindowInMinutes = 1,
        SegmentsPerWindow = 4
    };
}

public sealed class RateLimitPolicyOptions
{
    public int PermitLimit { get; init; } = 100;

    public int WindowInMinutes { get; init; } = 1;

    public int SegmentsPerWindow { get; init; } = 4;
}