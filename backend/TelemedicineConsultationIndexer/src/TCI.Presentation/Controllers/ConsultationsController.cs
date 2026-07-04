using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using TCI.Business.DTOs.Consultations.Requests;
using TCI.Business.DTOs.Consultations.Responses;
using TCI.Business.DTOs.Transcripts.Responses;
using TCI.Business.Models.Storage;
using TCI.Business.Services.Implementations;
using TCI.Business.Services.Interfaces;
using TCI.Presentation.Contracts.Consultations;
using TCI.Presentation.Extensions;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory.Database;

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

    [HttpPost]
    [Consumes("multipart/form-data")]
    [RequestSizeLimit(1_073_741_824)]
    [ProducesResponseType(typeof(CreateConsultationResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
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
    [ProducesResponseType(
        typeof(IReadOnlyList<ConsultationListItemResponse>),
        StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
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
    [ProducesResponseType(
        typeof(ConsultationDetailsResponse),
        StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
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
    [ProducesResponseType(
        typeof(ConsultationStatusResponse),
        StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
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
    [ProducesResponseType(typeof(ConsultationTranscriptResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
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
}