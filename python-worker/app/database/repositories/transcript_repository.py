from uuid import UUID, uuid4

from sqlalchemy import delete
from sqlalchemy.orm import Session

from app.database.models import (
    TranscriptSegment as TranscriptSegmentEntity,
)

from app.processing.transcription_result import (
    TranscriptionSegment,
)

class TranscriptRepository:
    def replace_segments(
        self,
        session: Session,
        consultation_id: UUID,
        segments: list[TranscriptionSegment],
    ) -> None:
        session.execute(
            delete(TranscriptSegmentEntity).where(
                TranscriptSegmentEntity.consultation_id
                == consultation_id
            )
        )

        transcript_segments = [
            TranscriptSegmentEntity(
                id=uuid4(),
                consultation_id=consultation_id,
                sequence_number=index + 1,
                start_seconds=segment.start_seconds,
                end_seconds=segment.end_seconds,
                text=segment.text,
            )
            for index, segment in enumerate(segments)
        ]

        session.add_all(transcript_segments)