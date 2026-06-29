using Microsoft.EntityFrameworkCore;
using TCI.DataAccess.Entities;
using TCI.DataAccess.Persistence;
using TCI.DataAccess.Repositories.Interfaces;
namespace TCI.DataAccess.Repositories.Implementations;

public class DoctorRepository(AppDbContext context) 
    : IDoctorRepository
{
    private readonly AppDbContext _context = context;

    public async Task AddAsync(Doctor doctor, CancellationToken cancellationToken = default)
    {
        await _context.Doctors.AddAsync(doctor, cancellationToken);
    }

    public Task<Doctor?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return _context.Doctors
            .AsNoTracking()
            .FirstOrDefaultAsync(doctor => doctor.Id == id, cancellationToken);
    }

    public Task<Doctor?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        return _context.Doctors.FirstOrDefaultAsync(doctor => doctor.Email == email, cancellationToken);
    }

    public Task<bool> EmailExistsAsync(string email, CancellationToken cancellationToken = default)
    {
        return _context.Doctors.AnyAsync(doctor => doctor.Email == email, cancellationToken);
    }
}
