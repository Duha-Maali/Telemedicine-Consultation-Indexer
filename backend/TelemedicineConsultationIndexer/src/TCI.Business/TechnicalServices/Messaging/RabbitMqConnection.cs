using Microsoft.Extensions.Options;
using RabbitMQ.Client;

namespace TCI.Business.TechnicalServices.Messaging;

public sealed class RabbitMqConnection : IRabbitMqConnection
{
    private readonly ConnectionFactory _connectionFactory;
    private readonly SemaphoreSlim _connectionLock = new(1, 1);

    private IConnection? _connection;
    private bool _disposed;

    public RabbitMqConnection(IOptions<RabbitMqSettings> options)
    {
        ArgumentNullException.ThrowIfNull(options);

        var settings = options.Value;

        ValidateSettings(settings);

        _connectionFactory = new ConnectionFactory
        {
            HostName = settings.HostName,
            Port = settings.Port,
            UserName = settings.UserName,
            Password = settings.Password,
            VirtualHost = settings.VirtualHost,

            AutomaticRecoveryEnabled = true,
            TopologyRecoveryEnabled = true,

            ClientProvidedName = settings.ClientProvidedName,

            RequestedHeartbeat = TimeSpan.FromSeconds(30),
            NetworkRecoveryInterval = TimeSpan.FromSeconds(5)
        };
    }

    public async Task<IConnection> GetConnectionAsync(CancellationToken cancellationToken = default)
    {
        ObjectDisposedException.ThrowIf(
            _disposed,
            this);

        if (_connection is { IsOpen: true })
        {
            return _connection;
        }

        await _connectionLock.WaitAsync(cancellationToken);

        try
        {
            if (_connection is { IsOpen: true })
            {
                return _connection;
            }

            if (_connection is not null)
            {
                await _connection.DisposeAsync();
                _connection = null;
            }

            _connection = await _connectionFactory.CreateConnectionAsync(cancellationToken);

            return _connection;
        }
        finally
        {
            _connectionLock.Release();
        }
    }

    public async ValueTask DisposeAsync()
    {
        if (_disposed)
        {
            return;
        }

        _disposed = true;

        if (_connection is not null)
        {
            await _connection.DisposeAsync();
            _connection = null;
        }

        _connectionLock.Dispose();

        GC.SuppressFinalize(this);
    }

    private static void ValidateSettings(RabbitMqSettings settings)
    {
        if (string.IsNullOrWhiteSpace(settings.HostName))
        {
            throw new InvalidOperationException("RabbitMQ host name is not configured.");
        }

        if (settings.Port <= 0)
        {
            throw new InvalidOperationException("RabbitMQ port must be greater than zero.");
        }

        if (string.IsNullOrWhiteSpace(settings.UserName))
        {
            throw new InvalidOperationException("RabbitMQ user name is not configured.");
        }

        if (string.IsNullOrWhiteSpace(settings.Password))
        {
            throw new InvalidOperationException("RabbitMQ password is not configured.");
        }

        if (string.IsNullOrWhiteSpace(settings.VirtualHost))
        {
            throw new InvalidOperationException("RabbitMQ virtual host is not configured.");
        }

        if (string.IsNullOrWhiteSpace(settings.ProcessingQueueName))
        {
            throw new InvalidOperationException("RabbitMQ processing queue name is not configured.");
        }
    }
}
