using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using TCI.Business.DTOs.Consultations.Requests;
using TCI.Business.DTOs.Consultations.Responses;
using TCI.Business.DTOs.Transcripts.Responses;
using TCI.Business.Models.Storage;
using TCI.Business.Services.Interfaces;
using TCI.Presentation.Contracts.Consultations;
using TCI.Presentation.Extensions;

namespace TCI.Presentation.Controllers;

[Route("api/consultations")]
[ApiController]
[Authorize]
public sealed class ConsultationsController(
    IConsultationService consultationService,
    ITranscriptService transcriptService)
    : ControllerBase
{
    private readonly IConsultationService _consultationService = consultationService;

    private readonly ITranscriptService _transcriptService = transcriptService;

    private const long MaximumFileSize = 1024L * 1024L * 1024L; // 1 GB

    private const long MaximumRequestSize = MaximumFileSize + (10L * 1024L * 1024L);

    [HttpPost]
    [Consumes("multipart/form-data")]
    [EnableRateLimiting("UploadPolicy")]
    [RequestSizeLimit(MaximumRequestSize)]
    [RequestFormLimits(MultipartBodyLengthLimit = MaximumRequestSize)]
    [ProducesResponseType(typeof(CreateConsultationResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status413PayloadTooLarge)]
    [ProducesResponseType(StatusCodes.Status429TooManyRequests)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    [ProducesResponseType(StatusCodes.Status503ServiceUnavailable)]
    public async Task<ActionResult<CreateConsultationResponse>> CreateAsync(
            [FromForm] CreateConsultationFormRequest request,
            CancellationToken cancellationToken)
    {
        var doctorId = User.GetDoctorId();

        await using var videoStream =
            request.Video.OpenReadStream();

        var businessRequest =
            new CreateConsultationRequest
            {
                Title = request.Title,
                PatientName = request.PatientName,
                ConsultationDate = request.ConsultationDate,

                Video = new FileUpload
                {
                    Content = videoStream,
                    FileName = request.Video.FileName,
                    ContentType = request.Video.ContentType,
                    Length = request.Video.Length
                }
            };

        var result = await _consultationService.CreateAsync(
            doctorId,
            businessRequest,
            cancellationToken);

        if (result.IsFailure)
        {
            return this.ToActionResult(result);
        }

        return StatusCode(
            StatusCodes.Status201Created,
            result.Value);
    }

    [HttpGet]
    [EnableRateLimiting("GeneralPolicy")]
    [ProducesResponseType(
        typeof(IReadOnlyList<ConsultationListItemResponse>),
        StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status429TooManyRequests)]
    public async Task<ActionResult<IReadOnlyList<ConsultationListItemResponse>>>GetAllAsync(
            CancellationToken cancellationToken)
    {
        var doctorId = User.GetDoctorId();

        var result = await _consultationService.GetAllForDoctorAsync(
            doctorId,
            cancellationToken);

        return this.ToActionResult(result);
    }

    [HttpGet("{consultationId:guid}")]
    [EnableRateLimiting("GeneralPolicy")]
    [ProducesResponseType(
        typeof(ConsultationDetailsResponse),
        StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status429TooManyRequests)]
    public async Task<ActionResult<ConsultationDetailsResponse>> GetByIdAsync(
            Guid consultationId,
            CancellationToken cancellationToken)
    {
        var doctorId = User.GetDoctorId();

        var result = await _consultationService.GetByIdAsync(
            consultationId,
            doctorId,
            cancellationToken);

        return this.ToActionResult(result);
    }

    [HttpGet("{consultationId:guid}/status")]
    [EnableRateLimiting("GeneralPolicy")]
    [ProducesResponseType(
        typeof(ConsultationStatusResponse),
        StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status429TooManyRequests)]
    public async Task<ActionResult<ConsultationStatusResponse>> GetStatusAsync(
            Guid consultationId,
            CancellationToken cancellationToken)
    {
        var doctorId = User.GetDoctorId();

        var result =  await _consultationService.GetStatusAsync(
            consultationId,
            doctorId,
            cancellationToken);

        return this.ToActionResult(result);
    }

    [HttpGet("{consultationId:guid}/transcript")]
    [EnableRateLimiting("GeneralPolicy")]
    [ProducesResponseType(typeof(ConsultationTranscriptResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    [ProducesResponseType(StatusCodes.Status429TooManyRequests)]
    public async Task<ActionResult<ConsultationTranscriptResponse>> GetTranscriptAsync(
        Guid consultationId,
        CancellationToken cancellationToken)
    {
        var doctorId = User.GetDoctorId();

        var result = await _transcriptService.GetByConsultationIdAsync(
            doctorId,
            consultationId,
            cancellationToken);

        return this.ToActionResult(result);
    }

    [HttpDelete("{consultationId:guid}")]
    [EnableRateLimiting("GeneralPolicy")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    [ProducesResponseType(StatusCodes.Status429TooManyRequests)]
    public async Task<IActionResult> DeleteAsync(
        Guid consultationId,
        CancellationToken cancellationToken)
    {
        var doctorId = User.GetDoctorId();

        var result = await _consultationService.DeleteAsync(
            doctorId,
            consultationId,
            cancellationToken);

        return this.ToActionResult(result);
    }

    [HttpGet("{consultationId:guid}/transcript/search")]
    [EnableRateLimiting("SearchPolicy")]
    [ProducesResponseType(
    typeof(IReadOnlyList<TranscriptSegmentResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    [ProducesResponseType(StatusCodes.Status429TooManyRequests)]
    public async Task<ActionResult<IReadOnlyList<TranscriptSegmentResponse>>> SearchTranscriptAsync(
        Guid consultationId,
        [FromQuery] string query,
        CancellationToken cancellationToken)
    {
        var doctorId = User.GetDoctorId();

        var result = await _transcriptService.SearchAsync(
                doctorId,
                consultationId,
                query,
                cancellationToken);

        return this.ToActionResult(result);
    }

    [HttpGet("{consultationId:guid}/video")]
    [EnableRateLimiting("GeneralPolicy")]
    [Produces("video/mp4", "video/webm", "video/quicktime", "video/x-matroska")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status206PartialContent)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status429TooManyRequests)]
    public async Task<IActionResult> GetVideoAsync(
    Guid consultationId,
    CancellationToken cancellationToken)
    {
        var doctorId = User.GetDoctorId();

        var result = await _consultationService.GetVideoAsync(
            doctorId,
            consultationId,
            cancellationToken);

        if (result.IsFailure)
        {
            return this.ToActionResult(result).Result!;
        }

        return new FileStreamResult(
            result.Value.Content,
            result.Value.ContentType)
        {
            EnableRangeProcessing = true
        };
    }
}