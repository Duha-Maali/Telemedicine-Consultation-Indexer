using TCI.DataAccess.Entities;

namespace TCI.DataAccess.Repositories.Interfaces;

public interface IDoctorRepository
{
    Task AddAsync(Doctor doctor, CancellationToken cancellationToken = default);   
    
    Task<Doctor?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task<Doctor?> GetByEmailAsync(string email, CancellationToken cancellationToken = default);

    Task<bool> EmailExistsAsync(string email, CancellationToken cancellationToken = default);
}
