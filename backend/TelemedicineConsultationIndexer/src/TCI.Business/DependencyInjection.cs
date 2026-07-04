using FluentValidation;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using TCI.Business.Abstractions.Messaging;
using TCI.Business.Abstractions.Storage;
using TCI.Business.Services.Implementations;
using TCI.Business.Services.Interfaces;
using TCI.Business.TechnicalServices.Messaging;
using TCI.Business.TechnicalServices.Storage;

namespace TCI.Business;

public static class DependencyInjection
{
    public static IServiceCollection AddBusinessLayer(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddScoped<IAuthService, AuthService>();

        services.AddScoped<IDoctorService, DoctorService>();

        services.AddScoped<IConsultationService, ConsultationService>();

        services.AddScoped<ITranscriptService, TranscriptService>();

        services.AddValidatorsFromAssembly(typeof(DependencyInjection).Assembly);

        services.AddAutoMapper(configurations =>
        {
            configurations.AddMaps(typeof(DependencyInjection).Assembly);
        });

        services.Configure<FileStorageSettings>(configuration.GetSection(FileStorageSettings.SectionName));

        services.AddSingleton<IFileStorageService, LocalFileStorageService>();

        services.Configure<RabbitMqSettings>(configuration.GetSection(RabbitMqSettings.SectionName));

        services.AddSingleton<IRabbitMqConnection, RabbitMqConnection>();

        services.AddScoped<IConsultationMessagePublisher, RabbitMqConsultationMessagePublisher>();

        return services;
    }
}
