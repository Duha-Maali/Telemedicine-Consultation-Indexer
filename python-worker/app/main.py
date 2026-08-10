import logging
import sys

from app.config.settings import get_settings
from app.database.connection import Database
from app.database.repositories.consultation_repository import (
    ConsultationRepository,
)
from app.messaging.rabbitmq_consumer import RabbitMqConsumer
from app.services.consultation_processor import (
    ConsultationProcessor,
)

from app.database.repositories.transcript_repository import (
    TranscriptRepository,
)

from app.processing.video_processor import VideoProcessor

from app.processing.transcription_service import (
    TranscriptionService,
)

def configure_logging() -> None:
    logging.basicConfig(
        level=logging.INFO,
        format=(
            "%(asctime)s | %(levelname)s | "
            "%(name)s | %(message)s"
        ),
    )


def main() -> int:
    configure_logging()

    logger = logging.getLogger(__name__)
    logger.info("Starting TCI Python Worker.")

    database: Database | None = None

    try:
        settings = get_settings()

        database = Database(settings)
        database.test_connection()

        logger.info(
            "PostgreSQL connection established successfully."
        )

        consultation_repository = ConsultationRepository()
        transcript_repository = TranscriptRepository()

        video_processor = VideoProcessor(
            settings.file_storage_root
        )

        transcription_service = TranscriptionService(
            model_size=settings.whisper_model_size,
            device=settings.whisper_device,
            compute_type=settings.whisper_compute_type,
        )

        processor = ConsultationProcessor(
            database,
            consultation_repository,
            transcript_repository,
            video_processor,
            transcription_service,
        )

        consumer = RabbitMqConsumer(
            settings,
            processor,
        )

        consumer.start()
        return 0

    except Exception:
        logger.exception(
            "Worker stopped because of a fatal error."
        )
        return 1

    finally:
        if database is not None:
            database.dispose()


if __name__ == "__main__":
    sys.exit(main())