import logging
import time
from datetime import datetime, timezone
from uuid import UUID

from app.database.connection import Database
from app.database.models import ConsultationStatus
from app.database.repositories.consultation_repository import (
    ConsultationRepository,
)


logger = logging.getLogger(__name__)


class ConsultationProcessor:
    def __init__(
        self,
        database: Database,
        repository: ConsultationRepository,
    ) -> None:
        self._database = database
        self._repository = repository

    def process(self, consultation_id: UUID) -> None:
        with self._database.create_session() as session:
            consultation = self._repository.get_by_id(
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

            self._repository.mark_processing(
                consultation
            )

            session.commit()

            logger.info(
                "Consultation status changed to Processing. "
                "ConsultationId=%s",
                consultation_id,
            )

        # محاكاة مؤقتة للمعالجة الثقيلة.
        time.sleep(3)

        with self._database.create_session() as session:
            consultation = self._repository.get_by_id(
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

            self._repository.mark_completed(
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