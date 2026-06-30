using Microsoft.EntityFrameworkCore;
using TCI.DataAccess.Entities;
using TCI.DataAccess.Enums;
using TCI.DataAccess.Persistence;
using TCI.DataAccess.Repositories.Interfaces;

namespace TCI.DataAccess.Repositories.Implementations;

public class ConsultationRepository(AppDbContext context) : IConsultationRepository
{
    private readonly AppDbContext _context = context;
    
    public Task<Consultation?> GetByIdForDoctorAsync(
        Guid consultationId, 
        Guid doctorId, 
        CancellationToken cancellationToken = default)
    {
        return _context.Consultations
            .AsNoTracking()
            .FirstOrDefaultAsync(
        consultation =>
            consultation.Id == consultationId &&
            consultation.DoctorId == doctorId,
        cancellationToken);
    }

    public async Task<IReadOnlyList<Consultation>> GetAllForDoctorAsync(Guid doctorId, CancellationToken cancellationToken = default)
    {
        return await _context.Consultations
            .AsNoTracking()
            .Where(consultation => consultation.DoctorId == doctorId)
            .OrderByDescending(consultation => consultation.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Consultation>> GetByStatusForDoctorAsync(Guid doctorId, ConsultationStatus status, CancellationToken cancellationToken = default)
    {
        return await _context.Consultations
            .AsNoTracking()
            .Where(consultation => 
                consultation.DoctorId == doctorId 
                && consultation.Status == status)
            .OrderByDescending(consultation => consultation.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task AddAsync(Consultation consultation, CancellationToken cancellationToken = default)
    {
        await _context.Consultations.AddAsync(consultation, cancellationToken);
    }
}
