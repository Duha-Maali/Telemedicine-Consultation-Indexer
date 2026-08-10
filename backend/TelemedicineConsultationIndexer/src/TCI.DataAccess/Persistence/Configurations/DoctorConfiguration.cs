using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TCI.DataAccess.Entities;

namespace TCI.DataAccess.Persistence.Configurations;

public class DoctorConfiguration : IEntityTypeConfiguration<Doctor>
{
    public void Configure(EntityTypeBuilder<Doctor> builder)
    {
        builder.ToTable("Doctors");
        
        builder.HasKey(doctor => doctor.Id);

        builder.Property(doctor => doctor.Id)
            .ValueGeneratedNever();

        builder.Property(doctor => doctor.FirstName)
            .IsRequired()
            .HasMaxLength(25);

        builder.Property(doctor => doctor.LastName)
            .IsRequired()
            .HasMaxLength(25);

        builder.Property(doctor => doctor.Email)
            .IsRequired()
            .HasMaxLength(100);

        builder.HasIndex(doctor => doctor.Email)
            .IsUnique();

        builder.Property(doctor => doctor.PasswordHash)
            .IsRequired();

        builder.Property(doctor => doctor.CreatedAt)
            .IsRequired();

        builder.HasMany(doctor => doctor.Consultations)
            .WithOne(consultation => consultation.Doctor)
            .HasForeignKey(consultation => consultation.DoctorId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
