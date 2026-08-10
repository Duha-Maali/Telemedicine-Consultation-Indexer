using RabbitMQ.Client;

namespace TCI.Business.TechnicalServices.Messaging;

public interface IRabbitMqConnection : IAsyncDisposable
{
    Task<IConnection> GetConnectionAsync(CancellationToken cancellationToken = default);
}
