import json
import logging
import time
from concurrent.futures import Future, ThreadPoolExecutor
from enum import Enum, auto
from functools import partial

import pika
from pika.adapters.blocking_connection import BlockingChannel
from pika.spec import Basic, BasicProperties
from pydantic import ValidationError
from sqlalchemy.exc import SQLAlchemyError

from app.common.exceptions import (
    ConsultationNotFoundError,
    ConsultationProcessingError,
    ConsultationProcessingSkipped,
)
from app.config.settings import Settings
from app.messaging.message_models import ProcessConsultationMessage
from app.services.consultation_processor import ConsultationProcessor

logger = logging.getLogger(__name__)


class _MessageDisposition(Enum):
    ACKNOWLEDGE = auto()
    REQUEUE = auto()
    DISCARD = auto()


class RabbitMqConsumer:
    def __init__(
        self,
        settings: Settings,
        consultation_processor: ConsultationProcessor,
    ) -> None:
        self._settings = settings
        self._consultation_processor = consultation_processor
        self._executor = ThreadPoolExecutor(
            max_workers=1,
            thread_name_prefix="consultation-processor",
        )
        self._processing_future: Future[_MessageDisposition] | None = None

    def start(self) -> None:
        try:
            while True:
                try:
                    self._consume()
                except KeyboardInterrupt:
                    logger.info("Worker shutdown requested.")
                    return
                except Exception:
                    logger.exception(
                        "RabbitMQ connection failed. Retrying in %s seconds.",
                        self._settings.rabbitmq_reconnect_delay_seconds,
                    )
                    time.sleep(
                        self._settings.rabbitmq_reconnect_delay_seconds
                    )
        finally:
            self._executor.shutdown(
                wait=True,
                cancel_futures=False,
            )

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
            heartbeat=self._settings.rabbitmq_heartbeat_seconds,
            blocked_connection_timeout=(
                self._settings
                .rabbitmq_blocked_connection_timeout_seconds
            ),
            connection_attempts=(
                self._settings.rabbitmq_connection_attempts
            ),
            retry_delay=(
                self._settings
                .rabbitmq_connection_retry_delay_seconds
            ),
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
                on_message_callback=partial(
                    self._on_message,
                    connection,
                ),
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

            self._wait_for_current_processing()

    def _on_message(
        self,
        connection: pika.BlockingConnection,
        channel: BlockingChannel,
        method: Basic.Deliver,
        properties: BasicProperties,
        body: bytes,
    ) -> None:
        try:
            payload = json.loads(body.decode("utf-8"))
            message = ProcessConsultationMessage.model_validate(
                payload
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

            self._settle_message(
                channel=channel,
                delivery_tag=method.delivery_tag,
                disposition=_MessageDisposition.DISCARD,
                consultation_id=None,
            )
            return

        logger.info(
            "Received consultation processing message. "
            "ConsultationId=%s MessageId=%s",
            message.consultation_id,
            properties.message_id,
        )

        if (
            self._processing_future is not None
            and not self._processing_future.done()
        ):
            logger.error(
                "A consultation is already being processed. "
                "The new message will be requeued. "
                "ConsultationId=%s",
                message.consultation_id,
            )

            self._settle_message(
                channel=channel,
                delivery_tag=method.delivery_tag,
                disposition=_MessageDisposition.REQUEUE,
                consultation_id=message.consultation_id,
            )
            return

        future = self._executor.submit(
            self._process_message,
            message,
        )

        self._processing_future = future

        future.add_done_callback(
            partial(
                self._schedule_settlement,
                connection,
                channel,
                method.delivery_tag,
                message.consultation_id,
            )
        )

    def _process_message(
        self,
        message: ProcessConsultationMessage,
    ) -> _MessageDisposition:
        try:
            self._consultation_processor.process(
                message.consultation_id
            )

            return _MessageDisposition.ACKNOWLEDGE

        except ConsultationNotFoundError:
            logger.warning(
                "Consultation does not exist. "
                "The message will be acknowledged. "
                "ConsultationId=%s",
                message.consultation_id,
            )
            return _MessageDisposition.ACKNOWLEDGE

        except ConsultationProcessingSkipped:
            logger.info(
                "Consultation processing was skipped. "
                "The message will be acknowledged. "
                "ConsultationId=%s",
                message.consultation_id,
            )
            return _MessageDisposition.ACKNOWLEDGE

        except ConsultationProcessingError:
            logger.error(
                "Consultation processing failed permanently. "
                "The message will be acknowledged. "
                "ConsultationId=%s",
                message.consultation_id,
            )
            return _MessageDisposition.ACKNOWLEDGE

        except SQLAlchemyError:
            logger.exception(
                "Database error while processing message. "
                "The message will be requeued. "
                "ConsultationId=%s",
                message.consultation_id,
            )
            return _MessageDisposition.REQUEUE

        except Exception:
            logger.exception(
                "Unexpected infrastructure error. "
                "The message will be requeued. "
                "ConsultationId=%s",
                message.consultation_id,
            )
            return _MessageDisposition.REQUEUE

    def _schedule_settlement(
        self,
        connection: pika.BlockingConnection,
        channel: BlockingChannel,
        delivery_tag: int,
        consultation_id,
        future: Future[_MessageDisposition],
    ) -> None:
        try:
            disposition = future.result()
        except Exception:
            logger.exception(
                "The background processing task ended unexpectedly. "
                "The message will be requeued when possible. "
                "ConsultationId=%s",
                consultation_id,
            )
            disposition = _MessageDisposition.REQUEUE

        if not connection.is_open:
            logger.warning(
                "RabbitMQ connection closed before the message could "
                "be acknowledged. RabbitMQ will requeue the unacknowledged "
                "message. ConsultationId=%s",
                consultation_id,
            )
            return

        callback = partial(
            self._settle_message,
            channel=channel,
            delivery_tag=delivery_tag,
            disposition=disposition,
            consultation_id=consultation_id,
        )

        try:
            connection.add_callback_threadsafe(callback)
        except pika.exceptions.ConnectionWrongStateError:
            logger.warning(
                "RabbitMQ connection closed before message settlement "
                "could be scheduled. RabbitMQ will requeue the "
                "unacknowledged message. ConsultationId=%s",
                consultation_id,
            )

    @staticmethod
    def _settle_message(
        channel: BlockingChannel,
        delivery_tag: int,
        disposition: _MessageDisposition,
        consultation_id,
    ) -> None:
        if not channel.is_open:
            logger.warning(
                "RabbitMQ channel is closed. The message could not be "
                "settled and will be requeued by RabbitMQ. "
                "ConsultationId=%s",
                consultation_id,
            )
            return

        try:
            if disposition == _MessageDisposition.ACKNOWLEDGE:
                channel.basic_ack(delivery_tag=delivery_tag)

                logger.info(
                    "Message acknowledged successfully. "
                    "ConsultationId=%s",
                    consultation_id,
                )
                return

            should_requeue = (
                disposition == _MessageDisposition.REQUEUE
            )

            channel.basic_nack(
                delivery_tag=delivery_tag,
                requeue=should_requeue,
            )

            if should_requeue:
                logger.warning(
                    "Message negatively acknowledged and requeued. "
                    "ConsultationId=%s",
                    consultation_id,
                )
            else:
                logger.warning(
                    "Invalid message discarded without requeueing."
                )

        except pika.exceptions.AMQPError:
            logger.exception(
                "RabbitMQ message settlement failed. The broker will "
                "requeue the message if the delivery remains "
                "unacknowledged. ConsultationId=%s",
                consultation_id,
            )

    def _wait_for_current_processing(self) -> None:
        future = self._processing_future

        if future is None or future.done():
            self._processing_future = None
            return

        logger.warning(
            "RabbitMQ connection ended while a consultation was still "
            "being processed. Waiting for the current task before "
            "reconnecting."
        )

        try:
            future.result()
        except Exception:
            logger.exception(
                "The active consultation task ended unexpectedly while "
                "waiting for RabbitMQ reconnection."
            )
        finally:
            self._processing_future = None