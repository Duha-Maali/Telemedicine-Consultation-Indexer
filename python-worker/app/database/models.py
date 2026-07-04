from datetime import datetime
from enum import IntEnum
from uuid import UUID

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID as PostgreSqlUUID
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


class ConsultationStatus(IntEnum):
    PENDING = 1
    PROCESSING = 2
    COMPLETED = 3
    FAILED = 4
    DELETION_REQUESTED = 5


class Consultation(Base):
    __tablename__ = "Consultations"

    id: Mapped[UUID] = mapped_column(
        "Id",
        PostgreSqlUUID(as_uuid=True),
        primary_key=True,
    )

    doctor_id: Mapped[UUID] = mapped_column(
        "DoctorId",
        PostgreSqlUUID(as_uuid=True),
        nullable=False,
    )

    title: Mapped[str] = mapped_column(
        "Title",
        String(50),
        nullable=False,
    )

    patient_name: Mapped[str] = mapped_column(
        "PatientName",
        String(50),
        nullable=False,
    )

    consultation_date: Mapped[datetime] = mapped_column(
        "ConsultationDate",
        DateTime(timezone=True),
        nullable=False,
    )

    original_file_name: Mapped[str] = mapped_column(
        "OriginalFileName",
        String(255),
        nullable=False,
    )

    file_path: Mapped[str] = mapped_column(
        "FilePath",
        String(1000),
        nullable=False,
    )

    duration_seconds: Mapped[float | None] = mapped_column(
        "DurationSeconds",
        Float,
        nullable=True,
    )

    status: Mapped[int] = mapped_column(
        "Status",
        Integer,
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        "CreatedAt",
        DateTime(timezone=True),
        nullable=False,
    )

    completed_at: Mapped[datetime | None] = mapped_column(
        "CompletedAt",
        DateTime(timezone=True),
        nullable=True,
    )

class TranscriptSegment(Base):
    __tablename__ = "TranscriptSegments"

    id: Mapped[UUID] = mapped_column(
        "Id",
        PostgreSqlUUID(as_uuid=True),
        primary_key=True,
    )

    consultation_id: Mapped[UUID] = mapped_column(
        "ConsultationId",
        PostgreSqlUUID(as_uuid=True),
        ForeignKey("Consultations.Id"),
        nullable=False,
    )

    sequence_number: Mapped[int] = mapped_column(
        "SequenceNumber",
        Integer,
        nullable=False,
    )

    start_seconds: Mapped[float] = mapped_column(
        "StartSeconds",
        Float,
        nullable=False,
    )

    end_seconds: Mapped[float] = mapped_column(
        "EndSeconds",
        Float,
        nullable=False,
    )

    text: Mapped[str] = mapped_column(
        "Text",
        String,
        nullable=False,
    )
    __tablename__ = "TranscriptSegments"

    id: Mapped[UUID] = mapped_column(
        "Id",
        PostgreSqlUUID(as_uuid=True),
        primary_key=True,
    )

    consultation_id: Mapped[UUID] = mapped_column(
        "ConsultationId",
        PostgreSqlUUID(as_uuid=True),
        ForeignKey("Consultations.Id"),
        nullable=False,
    )

    sequence_number: Mapped[int] = mapped_column(
        "SequenceNumber",
        Integer,
        nullable=False,
    )

    start_seconds: Mapped[float] = mapped_column(
        "StartSeconds",
        Float,
        nullable=False,
    )

    end_seconds: Mapped[float] = mapped_column(
        "EndSeconds",
        Float,
        nullable=False,
    )

    text: Mapped[str] = mapped_column(
        "Text",
        String,
        nullable=False,
    )