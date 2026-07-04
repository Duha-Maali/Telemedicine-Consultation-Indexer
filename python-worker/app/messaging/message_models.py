from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class ProcessConsultationMessage(BaseModel):
    consultation_id: UUID = Field(alias="consultationId")

    model_config = ConfigDict(
        populate_by_name=True,
        extra="forbid",
    )