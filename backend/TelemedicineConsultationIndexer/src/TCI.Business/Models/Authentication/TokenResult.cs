namespace TCI.Business.Models.Authentication;

public sealed class TokenResult
{
    public string AccessToken { get; init; } = string.Empty;
    public DateTime ExpiresAt { get; init; }
}
