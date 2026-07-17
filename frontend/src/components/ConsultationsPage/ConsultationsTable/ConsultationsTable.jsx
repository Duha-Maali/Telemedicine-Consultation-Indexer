import {
    CalendarDays,
    FileVideo2,
} from "lucide-react";

import StatusBadge from "../../shared/StatusBadge/StatusBadge";
import styles from "./ConsultationsTable.module.css";

import { Link } from "react-router-dom";

import {
    buildConsultationDetailsRoute,
} from "../../../utils/constants";

const dateFormatter = new Intl.DateTimeFormat(
    "en",
    {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }
);

function formatDate(value) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return dateFormatter.format(date);
}

function ConsultationsTable({
    consultations,
}) {
    if (consultations.length === 0) {
        return (
            <section
                className={styles.emptyState}
            >
                <span
                    className={styles.emptyIcon}
                >
                    <FileVideo2 size={26} />
                </span>

                <h2>No consultations found</h2>

                <p>
                    Your uploaded consultation
                    records will appear on this
                    page.
                </p>
            </section>
        );
    }

    return (
        <section className={styles.card}>
            <div
                className={styles.tableWrapper}
            >
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Consultation</th>
                            <th>Patient</th>
                            <th>Date</th>
                            <th>Status</th>
                        </tr>
                    </thead>

                    <tbody>
                        {consultations.map(
                            (consultation) => (
                                <tr
                                    key={
                                        consultation.id
                                    }
                                >
                                    <td>
                                        <div
                                            className={
                                                styles.titleCell
                                            }
                                        >
                                            <span
                                                className={
                                                    styles.videoIcon
                                                }
                                            >
                                                <FileVideo2
                                                    size={
                                                        18
                                                    }
                                                />
                                            </span>

                                            <Link
                                                className={styles.titleLink}
                                                to={buildConsultationDetailsRoute(
                                                    consultation.id
                                                )}
                                            >
                                                {consultation.title ||
                                                    "Untitled consultation"}
                                            </Link>
                                        </div>
                                    </td>

                                    <td>
                                        {consultation.patientName ||
                                            "Not specified"}
                                    </td>

                                    <td>
                                        <span
                                            className={
                                                styles.dateCell
                                            }
                                        >
                                            <CalendarDays
                                                size={
                                                    15
                                                }
                                            />

                                            {formatDate(
                                                consultation.consultationDate
                                            )}
                                        </span>
                                    </td>

                                    <td>
                                        <StatusBadge
                                            status={
                                                consultation.status
                                            }
                                        />
                                    </td>
                                </tr>
                            )
                        )}
                    </tbody>
                </table>
            </div>
        </section>
    );
}

export default ConsultationsTable;