using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using TCI.Business.DTOs.Auth.Requests;
using TCI.Business.DTOs.Auth.Responses;
using TCI.Business.Services.Interfaces;
using TCI.Presentation.Authentication;
using TCI.Presentation.Extensions;

namespace TCI.Presentation.Controllers;

[Route("api/auth")]
[ApiController]
public sealed class AuthController(IAuthService authService) : ControllerBase
{
    private readonly IAuthService _authService = authService;

    [AllowAnonymous]
    [HttpPost("register")]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<AuthResponse>> RegisterAsync(
        RegisterDoctorRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _authService.RegisterAsync(
            request,
            cancellationToken);

        if (result.IsFailure)
        {
            return this.ToActionResult(result);
        }

        AppendVideoAuthCookie(result.Value);

        return StatusCode(
            StatusCodes.Status201Created,
            result.Value);
    }

    [AllowAnonymous]
    [HttpPost("login")]
    [EnableRateLimiting("AuthPolicy")]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status429TooManyRequests)]
    public async Task<ActionResult<AuthResponse>> LoginAsync(
        LoginRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _authService.LoginAsync(
            request,
            cancellationToken);

        if (result.IsFailure)
        {
            return this.ToActionResult(result);
        }

        AppendVideoAuthCookie(result.Value);

        return Ok(result.Value);
    }

    [AllowAnonymous]
    [HttpPost("logout")]
    [EnableRateLimiting("AuthPolicy")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status429TooManyRequests)]
    public IActionResult Logout()
    {
        Response.Cookies.Delete(
            VideoAuthCookieDefaults.Name,
            CreateVideoCookieOptions());

        return NoContent();
    }

    private void AppendVideoAuthCookie(AuthResponse authResponse)
    {
        var cookieOptions = CreateVideoCookieOptions();
        cookieOptions.Expires = authResponse.ExpiresAt;

        Response.Cookies.Append(
            VideoAuthCookieDefaults.Name,
            authResponse.AccessToken,
            cookieOptions);
    }

    private CookieOptions CreateVideoCookieOptions()
    {
        return new CookieOptions
        {
            HttpOnly = true,
            Secure = Request.IsHttps,
            SameSite = SameSiteMode.Strict,
            Path = VideoAuthCookieDefaults.Path,
            IsEssential = true
        };
    }
}
