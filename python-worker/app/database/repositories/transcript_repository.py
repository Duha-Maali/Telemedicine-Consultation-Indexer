from uuid import UUID, uuid4

from sqlalchemy import delete
from sqlalchemy.orm import Session

from app.database.models import TranscriptSegment


class TranscriptRepository:
    def replace_segments(
        self,
        session: Session,
        consultation_id: UUID,
        segments: list[dict[str, float | str]],
    ) -> None:
        session.execute(
            delete(TranscriptSegment).where(
                TranscriptSegment.consultation_id
                == consultation_id
            )
        )

        transcript_segments = [
            TranscriptSegment(
                id=uuid4(),
                consultation_id=consultation_id,
                sequence_number=index + 1,
                start_seconds=float(
                    segment["start_seconds"]
                ),
                end_seconds=float(
                    segment["end_seconds"]
                ),
                text=str(segment["text"]),
            )
            for index, segment in enumerate(segments)
        ]

        session.add_all(transcript_segments)