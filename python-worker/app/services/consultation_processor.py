import logging
from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy.exc import SQLAlchemyError

from app.common.exceptions import (
    ConsultationNotFoundError,
    ConsultationProcessingError,
    ConsultationProcessingSkipped,
)
from app.database.connection import Database
from app.database.models import ConsultationStatus
from app.database.repositories.consultation_repository import (
    ConsultationRepository,
)
from app.database.repositories.transcript_repository import (
    TranscriptRepository,
)
from app.processing.transcription_service import TranscriptionService
from app.processing.video_processor import VideoProcessor

logger = logging.getLogger(__name__)


class ConsultationProcessor:
    def __init__(
        self,
        database: Database,
        consultation_repository: ConsultationRepository,
        transcript_repository: TranscriptRepository,
        video_processor: VideoProcessor,
        transcription_service: TranscriptionService,
    ) -> None:
        self._database = database
        self._consultation_repository = consultation_repository
        self._transcript_repository = transcript_repository
        self._video_processor = video_processor
        self._transcription_service = transcription_service

    def process(
        self,
        consultation_id: UUID,
    ) -> None:
        consultation_id_text = str(consultation_id)
        cleanup_required = False

        try:
            storage_key = self._start_processing(
                consultation_id
            )
            cleanup_required = True

            processing_result = self._video_processor.process(
                storage_key=storage_key,
                consultation_id=consultation_id_text,
            )

            transcription_result = (
                self._transcription_service.transcribe(
                    processing_result.audio_file_path
                )
            )

            self._complete_processing(
                consultation_id=consultation_id,
                duration_seconds=(
                    processing_result.duration_seconds
                ),
                segments=transcription_result.segments,
            )

        except ConsultationNotFoundError:
            raise

        except ConsultationProcessingSkipped:
            raise

        except SQLAlchemyError:
            logger.exception(
                "Database error while processing consultation. "
                "ConsultationId=%s",
                consultation_id,
            )
            raise

        except Exception as exception:
            logger.exception(
                "Consultation processing failed. "
                "ConsultationId=%s",
                consultation_id,
            )

            try:
                self._mark_failed(consultation_id)
            except SQLAlchemyError:
                logger.exception(
                    "Failed to update consultation status to Failed. "
                    "ConsultationId=%s",
                    consultation_id,
                )
                raise

            raise ConsultationProcessingError(
                f"Consultation '{consultation_id}' processing failed."
            ) from exception

        finally:
            if cleanup_required:
                self._video_processor.cleanup_processed_files(
                    consultation_id_text
                )

    def _start_processing(self, consultation_id: UUID) -> str:
        with self._database.create_session() as session:
            consultation = self._consultation_repository.get_by_id(
                session,
                consultation_id,
            )

            if consultation is None:
                raise ConsultationNotFoundError(
                    f"Consultation '{consultation_id}' "
                    "was not found."
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
                raise ConsultationProcessingSkipped()

            if consultation.status == ConsultationStatus.FAILED:
                logger.info(
                    "Consultation has already failed. "
                    "Skipping duplicate message. "
                    "ConsultationId=%s",
                    consultation_id,
                )
                raise ConsultationProcessingSkipped()

            if (
                consultation.status
                == ConsultationStatus.DELETION_REQUESTED
            ):
                logger.info(
                    "Consultation is marked for deletion. "
                    "Skipping processing. ConsultationId=%s",
                    consultation_id,
                )
                raise ConsultationProcessingSkipped()

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

            return storage_key

    def _complete_processing(
        self,
        consultation_id: UUID,
        duration_seconds: float,
        segments,
    ) -> None:
        with self._database.create_session() as session:
            consultation = (
                self._consultation_repository.get_by_id(
                    session,
                    consultation_id,
                )
            )

            if consultation is None:
                raise ConsultationNotFoundError(
                    f"Consultation '{consultation_id}' "
                    "was not found."
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

            self._transcript_repository.replace_segments(
                session,
                consultation_id,
                segments,
            )

            consultation.duration_seconds = duration_seconds

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

    def _mark_failed(
        self,
        consultation_id: UUID,
    ) -> None:
        with self._database.create_session() as session:
            consultation = (
                self._consultation_repository.get_by_id(
                    session,
                    consultation_id,
                )
            )

            if consultation is None:
                return

            if (
                consultation.status
                == ConsultationStatus.DELETION_REQUESTED
            ):
                return

            self._consultation_repository.mark_failed(
                consultation
            )

            session.commit()

            logger.info(
                "Consultation status changed to Failed. "
                "ConsultationId=%s",
                consultation_id,
            )