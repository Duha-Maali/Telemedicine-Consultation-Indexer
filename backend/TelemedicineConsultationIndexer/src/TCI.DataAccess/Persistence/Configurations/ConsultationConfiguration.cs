using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TCI.DataAccess.Entities;

namespace TCI.DataAccess.Persistence.Configurations;

public class ConsultationConfiguration : IEntityTypeConfiguration<Consultation>
{
    public void Configure(EntityTypeBuilder<Consultation> builder)
    {
        builder.ToTable("Consultations");

        builder.HasKey(consultation => consultation.Id);

        builder.Property(consultation => consultation.Id)
            .ValueGeneratedNever();

        builder.Property(consultation => consultation.Title)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(consultation => consultation.PatientName)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(consultation => consultation.ConsultationDate)
            .IsRequired();

        builder.Property(consultation => consultation.OriginalFileName)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(consultation => consultation.FilePath)
            .IsRequired()
            .HasMaxLength(1000);

        builder.Property(consultation => consultation.DurationSeconds);

        builder.Property(consultation => consultation.Status)
            .IsRequired();

        builder.Property(consultation => consultation.CreatedAt)
            .IsRequired();

        builder.Property(consultation => consultation.CompletedAt);

        builder.HasMany(consultation => consultation.TranscriptSegments)
            .WithOne(segment => segment.Consultation)
            .HasForeignKey(segment => segment.ConsultationId)
            .OnDelete(DeleteBehavior.Cascade);

    }
}
