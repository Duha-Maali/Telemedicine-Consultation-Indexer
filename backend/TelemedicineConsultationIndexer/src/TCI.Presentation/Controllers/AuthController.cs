using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using TCI.Business.DTOs.Auth.Requests;
using TCI.Business.DTOs.Auth.Responses;
using TCI.Business.Services.Interfaces;
using TCI.Presentation.Extensions;

namespace TCI.Presentation.Controllers
{
    [Route("api/auth")]
    [ApiController]
    public class AuthController(IAuthService authService) : ControllerBase
    {
        private readonly IAuthService _authService = authService;

        [AllowAnonymous]
        [HttpPost("register")]
        [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
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

            return StatusCode(
                StatusCodes.Status201Created,
                result.Value);
        }

        [AllowAnonymous]
        [HttpPost("login")]
        [ProducesResponseType(
        typeof(AuthResponse),
        StatusCodes.Status200OK)]
        [ProducesResponseType(
        StatusCodes.Status400BadRequest)]
        [ProducesResponseType(
        StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<AuthResponse>> LoginAsync(
            LoginRequest request,
            CancellationToken cancellationToken)
        {
            var result = await _authService.LoginAsync(
                    request,
                    cancellationToken);

            return this.ToActionResult(result);
        }
    }
}
