using TCI.DataAccess.Entities;
using TCI.DataAccess.Enums;

namespace TCI.DataAccess.Repositories.Interfaces;

public interface IConsultationRepository
{
    Task<Consultation?> GetByIdForDoctorAsync(
        Guid consultationId,
        Guid doctorId,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Consultation>> GetAllForDoctorAsync(
        Guid doctorId,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Consultation>> GetByStatusForDoctorAsync(
        Guid doctorId,
        ConsultationStatus status,
        CancellationToken cancellationToken = default
        );

    Task AddAsync(Consultation consultation, CancellationToken cancellationToken = default);

    void Delete(Consultation consultation);
}
