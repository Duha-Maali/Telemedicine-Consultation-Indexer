import json
import logging
import time

import pika
from pika.adapters.blocking_connection import BlockingChannel
from pika.spec import Basic, BasicProperties
from pydantic import ValidationError

from app.config.settings import Settings
from app.messaging.message_models import ProcessConsultationMessage

from app.services.consultation_processor import (
    ConsultationProcessor,
)

from sqlalchemy.exc import SQLAlchemyError

from app.common.exceptions import (
    ConsultationNotFoundError,
    ConsultationProcessingError,
    ConsultationProcessingSkipped,
)

logger = logging.getLogger(__name__)


class RabbitMqConsumer:
    def __init__(
        self,
        settings: Settings,
        consultation_processor: ConsultationProcessor,
    ) -> None:
        self._settings = settings
        self._consultation_processor = (
            consultation_processor
        )

    def start(self) -> None:
        while True:
            try:
                self._consume()
            except KeyboardInterrupt:
                logger.info("Worker shutdown requested.")
                return
            except Exception:
                logger.exception(
                    "RabbitMQ connection failed. Retrying in 5 seconds."
                )
                time.sleep(5)

    def _consume(self) -> None:
        credentials = pika.PlainCredentials(
            username=self._settings.rabbitmq_username,
            password=self._settings.rabbitmq_password,
        )

        parameters = pika.ConnectionParameters(
            host=self._settings.rabbitmq_host,
            port=self._settings.rabbitmq_port,
            virtual_host=self._settings.rabbitmq_virtual_host,
            credentials=credentials,
            heartbeat=60,
            blocked_connection_timeout=300,
            connection_attempts=3,
            retry_delay=5,
        )

        logger.info(
            "Connecting to RabbitMQ at %s:%s.",
            self._settings.rabbitmq_host,
            self._settings.rabbitmq_port,
        )

        connection = pika.BlockingConnection(parameters)

        try:
            channel = connection.channel()

            channel.queue_declare(
                queue=self._settings.rabbitmq_processing_queue,
                durable=True,
            )

            channel.basic_qos(prefetch_count=1)

            channel.basic_consume(
                queue=self._settings.rabbitmq_processing_queue,
                on_message_callback=self._on_message,
                auto_ack=False,
            )

            logger.info(
                "Waiting for messages from queue '%s'.",
                self._settings.rabbitmq_processing_queue,
            )

            channel.start_consuming()
        finally:
            if connection.is_open:
                connection.close()

    def _on_message(
        self,
        channel: BlockingChannel,
        method: Basic.Deliver,
        properties: BasicProperties,
        body: bytes,
    ) -> None:
        try:
            payload = json.loads(
                body.decode("utf-8")
            )

            message = (
                ProcessConsultationMessage.model_validate(
                    payload
                )
            )

            logger.info(
                "Received consultation processing message. "
                "ConsultationId=%s MessageId=%s",
                message.consultation_id,
                properties.message_id,
            )

            self._consultation_processor.process(
                message.consultation_id
            )

            channel.basic_ack(
                delivery_tag=method.delivery_tag
            )

            logger.info(
                "Message acknowledged successfully. "
                "ConsultationId=%s",
                message.consultation_id,
            )

        except (
            UnicodeDecodeError,
            json.JSONDecodeError,
            ValidationError,
        ):
            logger.exception(
                "Invalid RabbitMQ message. "
                "The message will not be requeued."
            )

            channel.basic_nack(
                delivery_tag=method.delivery_tag,
                requeue=False,
            )

        except ConsultationNotFoundError:
            logger.warning(
                "Consultation does not exist. "
                "The message will be acknowledged."
            )

            channel.basic_ack(
                delivery_tag=method.delivery_tag
            )

        except ConsultationProcessingSkipped:
            logger.info(
                "Consultation processing was skipped. "
                "The message will be acknowledged."
            )

            channel.basic_ack(
                delivery_tag=method.delivery_tag
            )

        except ConsultationProcessingError:
            logger.error(
                "Consultation processing failed permanently. "
                "The message will be acknowledged."
            )

            channel.basic_ack(
                delivery_tag=method.delivery_tag
            )

        except SQLAlchemyError:
            logger.exception(
                "Database error while processing message. "
                "The message will be requeued."
            )

            channel.basic_nack(
                delivery_tag=method.delivery_tag,
                requeue=True,
            )

        except Exception:
            logger.exception(
                "Unexpected infrastructure error. "
                "The message will be requeued."
            )

            channel.basic_nack(
                delivery_tag=method.delivery_tag,
                requeue=True,
            )