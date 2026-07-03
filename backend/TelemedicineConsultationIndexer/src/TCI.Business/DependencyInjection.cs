using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using TCI.Business.Services.Implementations;
using TCI.Business.Services.Interfaces;

namespace TCI.Business;

public static class DependencyInjection
{
    public static IServiceCollection AddBusinessLayer(this IServiceCollection services)
    {
        services.AddScoped<IAuthService, AuthService>();

        services.AddScoped<IDoctorService, DoctorService>();

        services.AddScoped<IConsultationService, ConsultationService>();

        services.AddValidatorsFromAssembly(typeof(DependencyInjection).Assembly);

        services.AddAutoMapper(configurations =>
        {
            configurations.AddMaps(typeof(DependencyInjection).Assembly);
        });

        return services;
    }
}
