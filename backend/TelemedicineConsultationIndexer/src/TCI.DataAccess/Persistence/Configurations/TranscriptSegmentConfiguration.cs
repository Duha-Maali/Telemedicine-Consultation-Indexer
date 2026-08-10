using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TCI.DataAccess.Entities;

namespace TCI.DataAccess.Persistence.Configurations;

public class TranscriptSegmentConfiguration : IEntityTypeConfiguration<TranscriptSegment>
{
    public void Configure(EntityTypeBuilder<TranscriptSegment> builder)
    {
        builder.ToTable("TranscriptSegments");

        builder.HasKey(segment => segment.Id);

        builder.Property(segment => segment.Id)
            .ValueGeneratedNever();

        builder.Property(segment => segment.SequenceNumber)
            .IsRequired();

        builder.Property(segment => segment.StartSeconds)
            .IsRequired();

        builder.Property(segment => segment.EndSeconds)
            .IsRequired();

        builder.Property(segment => segment.Text)
            .IsRequired();

        builder.HasIndex(segment => new
        {
            segment.ConsultationId,
            segment.SequenceNumber,
        })
            .IsUnique();
    }
}
