using System.Security.Claims;

namespace TCI.Presentation.Extensions;

public static class ClaimsPrincipalExtensions
{
    public static Guid GetDoctorId(this ClaimsPrincipal user)
    {
        var doctorIdValue = user.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!Guid.TryParse(doctorIdValue, out var doctorId))
        {
            throw new UnauthorizedAccessException("The authenticated user identifier is invalid.");
        }

        return doctorId;
    }
}
