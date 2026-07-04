import logging
import time
from datetime import datetime, timezone
from uuid import UUID

from app.database.connection import Database
from app.database.models import ConsultationStatus
from app.database.repositories.consultation_repository import (
    ConsultationRepository,
)

from app.database.repositories.transcript_repository import (
    TranscriptRepository,
)

from app.processing.video_processor import VideoProcessor

logger = logging.getLogger(__name__)


class ConsultationProcessor:
    def __init__(
        self,
        database: Database,
        consultation_repository: ConsultationRepository,
        transcript_repository: TranscriptRepository,
        video_processor: VideoProcessor,
    ) -> None:
        self._database = database
        self._consultation_repository = (
            consultation_repository
        )
        self._transcript_repository = (
            transcript_repository
        )
        self._video_processor = video_processor


    def process(self, consultation_id: UUID) -> None:
        with self._database.create_session() as session:
            consultation = self._consultation_repository.get_by_id(
                session,
                consultation_id,
            )

            if consultation is None:
                raise ValueError(
                    f"Consultation '{consultation_id}' was not found."
                )

            if (
                consultation.status
                == ConsultationStatus.COMPLETED
            ):
                logger.info(
                    "Consultation is already completed. "
                    "Skipping duplicate message. "
                    "ConsultationId=%s",
                    consultation_id,
                )
                return

            if (
                consultation.status
                == ConsultationStatus.DELETION_REQUESTED
            ):
                logger.info(
                    "Consultation is marked for deletion. "
                    "Skipping processing. ConsultationId=%s",
                    consultation_id,
                )
                return

            storage_key = consultation.file_path    

            self._consultation_repository.mark_processing(
                consultation
            )

            session.commit()

            logger.info(
                "Consultation status changed to Processing. "
                "ConsultationId=%s",
                consultation_id,
            )


        # محاكاة مؤقتة للمعالجة الثقيلة.
        processing_result = self._video_processor.process(
            storage_key=storage_key,
            consultation_id=str(consultation_id),
        )

        mock_segments = [
            {
                "start_seconds": 0.0,
                "end_seconds": 5.0,
                "text": "Doctor: Hello, how can I help you today?",
            },
            {
                "start_seconds": 5.0,
                "end_seconds": 11.0,
                "text": "Patient: I have been experiencing headaches for three days.",
            },
            {
                "start_seconds": 11.0,
                "end_seconds": 17.0,
                "text": "Doctor: Are the headaches constant or intermittent?",
            },
        ]

        with self._database.create_session() as session:
            consultation = self._consultation_repository.get_by_id(
                session,
                consultation_id,
            )

            if consultation is None:
                raise ValueError(
                    f"Consultation '{consultation_id}' was not found."
                )

            if (
                consultation.status
                == ConsultationStatus.DELETION_REQUESTED
            ):
                logger.info(
                    "Consultation was marked for deletion "
                    "during processing. ConsultationId=%s",
                    consultation_id,
                )
                return

            self._consultation_repository.mark_completed(
                consultation
            )

            consultation.completed_at = datetime.now(
                timezone.utc
            )

            self._transcript_repository.replace_segments(
                session,
                consultation_id,
                mock_segments,
            )

            consultation.duration_seconds = (
                processing_result.duration_seconds
            )

            self._consultation_repository.mark_completed(
                consultation
            )

            consultation.completed_at = datetime.now(
                timezone.utc
            )

            session.commit()

            logger.info(
                "Consultation status changed to Completed. "
                "ConsultationId=%s",
                consultation_id,
            )