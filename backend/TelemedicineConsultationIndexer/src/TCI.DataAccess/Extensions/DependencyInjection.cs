using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using TCI.DataAccess.Persistence;
using TCI.DataAccess.Repositories.Implementations;
using TCI.DataAccess.Repositories.Interfaces;

namespace TCI.DataAccess.Extensions;

public static class DependencyInjection
{
    public static IServiceCollection AddDataAccess(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection");

        ArgumentNullException.ThrowIfNull(connectionString);

        services.AddDbContext<AppDbContext>(options => 
            options.UseNpgsql(connectionString));

        services.AddScoped<IDoctorRepository, DoctorRepository>();
        services.AddScoped<IConsultationRepository, ConsultationRepository>();
        services.AddScoped<ITranscriptSegmentRepository, TranscriptSegmentRepository>();

        return services;
    }
}
