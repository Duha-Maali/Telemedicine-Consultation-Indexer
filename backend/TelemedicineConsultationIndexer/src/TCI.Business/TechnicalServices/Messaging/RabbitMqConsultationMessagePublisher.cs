using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using RabbitMQ.Client;
using System.Text.Json;
using TCI.Business.Abstractions.Messaging;
using TCI.Business.Models.Messaging;

namespace TCI.Business.TechnicalServices.Messaging;

public sealed class RabbitMqConsultationMessagePublisher : IConsultationMessagePublisher
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    private readonly IRabbitMqConnection _rabbitMqConnection;
    private readonly RabbitMqSettings _settings;
    private readonly ILogger<RabbitMqConsultationMessagePublisher> _logger;

    public RabbitMqConsultationMessagePublisher(
        IRabbitMqConnection rabbitMqConnection,
        IOptions<RabbitMqSettings> options,
        ILogger<RabbitMqConsultationMessagePublisher> logger)
    {
        ArgumentNullException.ThrowIfNull(rabbitMqConnection);
        ArgumentNullException.ThrowIfNull(options);
        ArgumentNullException.ThrowIfNull(logger);

        _rabbitMqConnection = rabbitMqConnection;
        _settings = options.Value;
        _logger = logger;
    }

    public async Task PublishProcessingRequestAsync(
        ProcessConsultationMessage message,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(message);

        var connection = await _rabbitMqConnection.GetConnectionAsync(cancellationToken);

        var channelOptions = new CreateChannelOptions(
            publisherConfirmationsEnabled: true,
            publisherConfirmationTrackingEnabled: true);

        await using var channel = await connection.CreateChannelAsync(
            channelOptions,
            cancellationToken);

        await channel.QueueDeclareAsync(
            queue: _settings.ProcessingQueueName,
            durable: true,
            exclusive: false,
            autoDelete: false,
            arguments: null,
            cancellationToken: cancellationToken);

        var body = JsonSerializer.SerializeToUtf8Bytes(
            message,
            JsonOptions);

        var properties = new BasicProperties
        {
            ContentType = "application/json",
            ContentEncoding = "utf-8",
            DeliveryMode = DeliveryModes.Persistent,
            MessageId = Guid.NewGuid().ToString("N"),
            Type = nameof(ProcessConsultationMessage),
            Timestamp = new AmqpTimestamp(DateTimeOffset.UtcNow.ToUnixTimeSeconds())
        };

        try
        {
            await channel.BasicPublishAsync(
                exchange: string.Empty,
                routingKey: _settings.ProcessingQueueName,
                mandatory: true,
                basicProperties: properties,
                body: body,
                cancellationToken: cancellationToken);

            _logger.LogInformation(
                "Published processing message for consultation {ConsultationId} to queue {QueueName}.",
                message.ConsultationId,
                _settings.ProcessingQueueName);
        }
        catch (Exception exception)
        {
            _logger.LogError(
                exception,
                "Failed to publish processing message for consultation {ConsultationId} to queue {QueueName}.",
                message.ConsultationId,
                _settings.ProcessingQueueName);

            throw;
        }
    }
}