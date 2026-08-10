namespace TCI.DataAccess.Entities;

public class Doctor
{
    public Guid Id { get; set; }
    public string FirstName { get; set; } = null!;

    public string LastName { get; set; } = null!;

    public string Email { get; set; } = null!;
    public string PasswordHash { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
    public ICollection<Consultation> Consultations { get; set; } = new List<Consultation>();
}
