using System.ComponentModel.DataAnnotations;

namespace TCI.Presentation.Contracts.Consultations;

public sealed class CreateConsultationFormRequest
{
    [Required]
    public string Title { get; init; } = string.Empty;

    [Required]
    public string PatientName { get; init; } = string.Empty;

    [Required]
    public DateTime ConsultationDate { get; init; }

    [Required]
    public IFormFile Video { get; init; } = null!;
}
