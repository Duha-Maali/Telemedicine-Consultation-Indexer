import {
    ArrowUpRight,
    CalendarDays,
    FileVideo2,
    LoaderCircle,
    Trash2,
} from "lucide-react";
import { Link } from "react-router-dom";

import {
    buildConsultationDetailsRoute,
    CONSULTATION_STATUS,
} from "../../../utils/constants";
import StatusBadge from "../../shared/StatusBadge/StatusBadge";

import styles from "./ConsultationsTable.module.css";

const dateFormatter = new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
});

function formatDate(value) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return dateFormatter.format(date);
}

function ConsultationsTable({
    consultations,
    deletingConsultationId,
    onRequestDelete,
}) {
    if (consultations.length === 0) {
        return (
            <section className={styles.emptyState}>
                <span className={styles.emptyIcon}>
                    <FileVideo2 size={26} />
                </span>
                <h2>No consultations found</h2>
                <p>Your uploaded consultation records will appear on this page.</p>
            </section>
        );
    }

    return (
        <section className={styles.card}>
            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Consultation</th>
                            <th>Patient</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th aria-label="Actions" />
                        </tr>
                    </thead>
                    <tbody>
                        {consultations.map((consultation) => {
                            const detailsRoute = buildConsultationDetailsRoute(
                                consultation.id
                            );
                            const isProcessing =
                                consultation.status ===
                                CONSULTATION_STATUS.PROCESSING;
                            const isDeleting =
                                deletingConsultationId === consultation.id;
                            const consultationTitle =
                                consultation.title || "Untitled consultation";

                            return (
                                <tr key={consultation.id}>
                                    <td>
                                        <div className={styles.titleCell}>
                                            <span className={styles.videoIcon}>
                                                <FileVideo2 size={18} />
                                            </span>
                                            <Link
                                                className={styles.titleLink}
                                                to={detailsRoute}
                                            >
                                                {consultationTitle}
                                            </Link>
                                        </div>
                                    </td>
                                    <td>
                                        {consultation.patientName || "Not specified"}
                                    </td>
                                    <td>
                                        <span className={styles.dateCell}>
                                            <CalendarDays size={15} />
                                            {formatDate(consultation.consultationDate)}
                                        </span>
                                    </td>
                                    <td>
                                        <StatusBadge status={consultation.status} />
                                    </td>
                                    <td className={styles.actionCell}>
                                        <div className={styles.actionGroup}>
                                            <Link
                                                className={styles.detailsLink}
                                                to={detailsRoute}
                                                aria-label={`View details for ${consultationTitle}`}
                                            >
                                                View details
                                                <ArrowUpRight size={15} />
                                            </Link>

                                            <button
                                                className={styles.deleteButton}
                                                type="button"
                                                onClick={() =>
                                                    onRequestDelete(consultation.id)
                                                }
                                                disabled={isProcessing || isDeleting}
                                                title={
                                                    isProcessing
                                                        ? "Delete unavailable while processing."
                                                        : undefined
                                                }
                                                aria-label={
                                                    isProcessing
                                                        ? `Delete unavailable while ${consultationTitle} is processing`
                                                        : `Delete ${consultationTitle}`
                                                }
                                            >
                                                {isDeleting ? (
                                                    <LoaderCircle
                                                        className={styles.spinning}
                                                        size={15}
                                                    />
                                                ) : (
                                                    <Trash2 size={15} />
                                                )}
                                                {isDeleting ? "Deleting" : "Delete"}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </section>
    );
}

export default ConsultationsTable;
