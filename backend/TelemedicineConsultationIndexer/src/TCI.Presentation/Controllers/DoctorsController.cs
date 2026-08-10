using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using TCI.Business.DTOs.Doctors.Responses;
using TCI.Business.Services.Interfaces;
using TCI.Presentation.Extensions;

namespace TCI.Presentation.Controllers
{
    [Route("api/doctors")]
    [ApiController]
    [Authorize]
    public sealed class DoctorsController(
        IDoctorService doctorService) : ControllerBase
    {
        private readonly IDoctorService _doctorService = doctorService;

        [HttpGet("me")]
        [EnableRateLimiting("GeneralPolicy")]
        [ProducesResponseType(typeof(DoctorResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status429TooManyRequests)]
        public async Task<ActionResult<DoctorResponse>> GetCurrentDoctorAsync(CancellationToken cancellationToken)
        {
            var doctorId = User.GetDoctorId();

            var result = await _doctorService.GetByIdAsync(
                    doctorId,
                    cancellationToken);

            return this.ToActionResult(result);
        }
    }
}
