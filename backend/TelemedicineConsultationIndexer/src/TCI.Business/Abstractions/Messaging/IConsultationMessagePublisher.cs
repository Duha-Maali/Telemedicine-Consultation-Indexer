using TCI.Business.Models.Messaging;

namespace TCI.Business.Abstractions.Messaging;

public interface IConsultationMessagePublisher
{
    Task PublishProcessingRequestAsync(
        ProcessConsultationMessage message,
        CancellationToken cancellationToken = default);
}
