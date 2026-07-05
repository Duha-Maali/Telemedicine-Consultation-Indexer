import logging
from pathlib import Path

from faster_whisper import WhisperModel

from app.processing.transcription_result import (
    TranscriptionResult,
    TranscriptionSegment,
)


logger = logging.getLogger(__name__)


class TranscriptionService:
    def __init__(
        self,
        model_size: str,
        device: str,
        compute_type: str,
    ) -> None:
        logger.info(
            "Loading Whisper model. Model=%s Device=%s ComputeType=%s",
            model_size,
            device,
            compute_type,
        )

        self._model = WhisperModel(
            model_size,
            device=device,
            compute_type=compute_type,
        )

        logger.info("Whisper model loaded successfully.")

    def transcribe(
        self,
        audio_file_path: Path,
    ) -> TranscriptionResult:
        if not audio_file_path.exists():
            raise FileNotFoundError(
                f"Audio file was not found: {audio_file_path}"
            )

        logger.info(
            "Starting audio transcription. AudioPath=%s",
            audio_file_path,
        )

        segments_iterator, info = self._model.transcribe(
            str(audio_file_path),
            task="transcribe",
            beam_size=5,
            vad_filter=True,
            condition_on_previous_text=True,
        )

        segments: list[TranscriptionSegment] = []

        for segment in segments_iterator:
            text = segment.text.strip()

            if not text:
                continue

            segments.append(
                TranscriptionSegment(
                    start_seconds=float(segment.start),
                    end_seconds=float(segment.end),
                    text=text,
                )
            )

        if not segments:
            raise RuntimeError(
                "The transcription model returned no transcript segments."
            )

        logger.info(
            "Audio transcription completed. "
            "Language=%s Probability=%.2f SegmentCount=%s",
            info.language,
            info.language_probability,
            len(segments),
        )

        return TranscriptionResult(
            language=info.language,
            language_probability=float(
                info.language_probability
            ),
            segments=segments,
        )