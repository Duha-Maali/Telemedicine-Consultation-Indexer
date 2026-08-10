from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class VideoProcessingResult:
    duration_seconds: float
    audio_file_path: Path