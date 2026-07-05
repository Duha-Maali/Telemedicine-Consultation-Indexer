from dataclasses import dataclass


@dataclass(frozen=True)
class TranscriptionSegment:
    start_seconds: float
    end_seconds: float
    text: str


@dataclass(frozen=True)
class TranscriptionResult:
    language: str
    language_probability: float
    segments: list[TranscriptionSegment]