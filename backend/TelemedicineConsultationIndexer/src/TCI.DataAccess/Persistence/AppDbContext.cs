using Microsoft.EntityFrameworkCore;
using TCI.DataAccess.Entities;

namespace TCI.DataAccess.Persistence;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    { 
    }

    public DbSet<Doctor> Doctors => Set<Doctor>();

    public DbSet<Consultation> Consultations => Set<Consultation>();

    public DbSet<TranscriptSegment> TranscriptSegments => Set<TranscriptSegment>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.ApplyConfigurationsFromAssembly(
            typeof(AppDbContext).Assembly
            );
    }
}
