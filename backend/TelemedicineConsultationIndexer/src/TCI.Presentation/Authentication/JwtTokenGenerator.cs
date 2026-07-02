using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using TCI.Business.Abstractions.Authentication;
using TCI.Business.Models.Authentication;
using TCI.DataAccess.Entities;

namespace TCI.Presentation.Authentication;

public sealed class JwtTokenGenerator(IOptions<JwtSettings> jwtOptions) : ITokenGenerator
{
    private readonly JwtSettings _jwtSettings = jwtOptions.Value;
    public TokenResult Generate(Doctor doctor)
    {
        ArgumentNullException.ThrowIfNull(doctor);

        var expiresAt = DateTime.UtcNow.AddMinutes(_jwtSettings.ExpirationMinutes);

        var claims = new List<Claim>
        {
            new(
                JwtRegisteredClaimNames.Sub,
                doctor.Id.ToString()),

            new(
                ClaimTypes.NameIdentifier,
                doctor.Id.ToString()),

            new(
                JwtRegisteredClaimNames.Email,
                doctor.Email),

            new(
                ClaimTypes.Name,
                $"{doctor.FirstName} {doctor.LastName}"),

            new(
                JwtRegisteredClaimNames.Jti,
                Guid.NewGuid().ToString())
        };

        var signingKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_jwtSettings.Key));

        var signingCredentials = new SigningCredentials(
            signingKey,
            SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _jwtSettings.Issuer,
            audience: _jwtSettings.Audience,
            claims: claims,
            notBefore: DateTime.UtcNow,
            expires: expiresAt,
            signingCredentials: signingCredentials);

        var accessToken =
            new JwtSecurityTokenHandler()
                .WriteToken(token);

        return new TokenResult
        {
            AccessToken = accessToken,
            ExpiresAt = expiresAt
        };
    }
}
