import logging
import subprocess
from pathlib import Path

from app.processing.video_processing_result import (
    VideoProcessingResult,
)


logger = logging.getLogger(__name__)


class VideoProcessor:
    def __init__(self, storage_root: str) -> None:
        self._storage_root = Path(storage_root).resolve()

        if not self._storage_root.exists():
            raise FileNotFoundError(
                f"File storage directory was not found: "
                f"{self._storage_root}"
            )

        if not self._storage_root.is_dir():
            raise NotADirectoryError(
                f"File storage path is not a directory: "
                f"{self._storage_root}"
            )

    def process(
        self,
        storage_key: str,
        consultation_id: str,
    ) -> VideoProcessingResult:
        video_path = self._resolve_video_path(storage_key)

        duration_seconds = self._get_duration(video_path)

        audio_directory = (
            self._storage_root
            / "processed"
            / consultation_id
        )

        audio_directory.mkdir(
            parents=True,
            exist_ok=True,
        )

        audio_path = audio_directory / "audio.wav"

        self._extract_audio(
            video_path,
            audio_path,
        )

        logger.info(
            "Video prepared successfully. "
            "VideoPath=%s AudioPath=%s DurationSeconds=%.2f",
            video_path,
            audio_path,
            duration_seconds,
        )

        return VideoProcessingResult(
            duration_seconds=duration_seconds,
            audio_file_path=audio_path,
        )

    def _resolve_video_path(
        self,
        storage_key: str,
    ) -> Path:
        if not storage_key:
            raise ValueError(
                "Consultation file path is missing."
            )

        safe_file_name = Path(storage_key).name

        if safe_file_name != storage_key:
            raise ValueError(
                "Consultation storage key is invalid."
            )

        video_path = (
            self._storage_root / safe_file_name
        ).resolve()

        if self._storage_root not in video_path.parents:
            raise ValueError(
                "Resolved video path is outside "
                "the storage directory."
            )

        if not video_path.exists():
            raise FileNotFoundError(
                f"Consultation video was not found: "
                f"{video_path}"
            )

        if not video_path.is_file():
            raise ValueError(
                f"Consultation video path is not a file: "
                f"{video_path}"
            )

        return video_path

    def _get_duration(
        self,
        video_path: Path,
    ) -> float:
        command = [
            "ffprobe",
            "-v",
            "error",
            "-show_entries",
            "format=duration",
            "-of",
            "default=noprint_wrappers=1:nokey=1",
            str(video_path),
        ]

        result = self._run_command(command)

        try:
            duration = float(result.stdout.strip())
        except ValueError as exception:
            raise RuntimeError(
                "FFprobe returned an invalid video duration."
            ) from exception

        if duration <= 0:
            raise RuntimeError(
                "The video duration must be greater than zero."
            )

        return duration

    def _extract_audio(
        self,
        video_path: Path,
        audio_path: Path,
    ) -> None:
        command = [
            "ffmpeg",
            "-y",
            "-i",
            str(video_path),
            "-vn",
            "-ac",
            "1",
            "-ar",
            "16000",
            "-c:a",
            "pcm_s16le",
            str(audio_path),
        ]

        self._run_command(command)

        if not audio_path.exists():
            raise RuntimeError(
                "FFmpeg did not create the audio file."
            )

    @staticmethod
    def _run_command(
        command: list[str],
    ) -> subprocess.CompletedProcess[str]:
        try:
            return subprocess.run(
                command,
                capture_output=True,
                text=True,
                check=True,
                timeout=3600,
            )
        except FileNotFoundError as exception:
            raise RuntimeError(
                "FFmpeg or FFprobe was not found. "
                "Make sure FFmpeg is installed and available "
                "in the system PATH."
            ) from exception
        except subprocess.TimeoutExpired as exception:
            raise RuntimeError(
                "Media processing exceeded the allowed time."
            ) from exception
        except subprocess.CalledProcessError as exception:
            error_output = (
                exception.stderr.strip()
                or exception.stdout.strip()
            )

            raise RuntimeError(
                f"Media processing failed: {error_output}"
            ) from exception