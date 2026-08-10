using Microsoft.Extensions.Logging;
using TCI.DataAccess.Persistence;

namespace TCI.DataAccess.UnitOfWork;

public class UnitOfWork(
    AppDbContext context,
    ILogger<UnitOfWork> logger) : IUnitOfWork
{
    private readonly AppDbContext _context = context;

    private readonly ILogger<UnitOfWork> _logger = logger;
    public async Task SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            var affectedRows = await _context.SaveChangesAsync(cancellationToken);

            _logger.LogDebug(
                   "Database changes saved successfully. AffectedRows={AffectedRows}.",
                   affectedRows);
        }
        catch (Exception exception)
        {
            _logger.LogError(
                exception,
                "Failed to save database changes.");

            throw;
        }
    }
}
