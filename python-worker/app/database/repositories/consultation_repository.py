from uuid import UUID

from sqlalchemy.orm import Session

from app.database.models import Consultation, ConsultationStatus


class ConsultationRepository:
    def get_by_id(
        self,
        session: Session,
        consultation_id: UUID,
    ) -> Consultation | None:
        return session.get(
            Consultation,
            consultation_id,
        )

    def mark_processing(
        self,
        consultation: Consultation,
    ) -> None:
        consultation.status = ConsultationStatus.PROCESSING

    def mark_completed(
        self,
        consultation: Consultation,
    ) -> None:
        consultation.status = ConsultationStatus.COMPLETED