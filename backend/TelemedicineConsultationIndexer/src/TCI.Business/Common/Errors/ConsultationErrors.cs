using TCI.Business.Common.Results;

namespace TCI.Business.Common.Errors;

public static class ConsultationErrors
{
    public static readonly Error NotFound = new(
        "Consultation.NotFound",
        "The consultation was not found.",
        ErrorType.NotFound);

    public static readonly Error FileRequired = new(
        "Consultation.FileRequired",
        "A consultation video file is required.",
        ErrorType.Validation);

    public static readonly Error FileStorageFailed = new(
        "Consultation.FileStorageFailed",
        "The consultation video could not be stored.",
        ErrorType.Failure);

    public static readonly Error MessagePublishingFailed = new(
        "Consultation.MessagePublishingFailed",
        "The consultation was created, but processing could not be started.",
        ErrorType.Failure);

    public static readonly Error TranscriptNotReady = new(
        "Consultation.TranscriptNotReady",
        "The consultation transcript is not ready yet.",
        ErrorType.Conflict);
}
