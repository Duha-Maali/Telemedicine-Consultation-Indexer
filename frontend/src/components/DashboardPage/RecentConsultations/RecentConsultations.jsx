import {
    CalendarDays,
    FileVideo2,
} from "lucide-react";

import StatusBadge from "../../shared/StatusBadge/StatusBadge";
import styles from "./RecentConsultations.module.css";

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

function RecentConsultations({
    consultations,
}) {
    return (
        <section className={styles.section}>
            <div className={styles.sectionHeader}>
                <div>
                    <span
                        className={styles.eyebrow}
                    >
                        Latest activity
                    </span>

                    <h2>Recent consultations</h2>

                    <p>
                        Your most recently dated
                        consultation records.
                    </p>
                </div>
            </div>

            {consultations.length === 0 ? (
                <div className={styles.emptyState}>
                    <span
                        className={styles.emptyIcon}
                    >
                        <FileVideo2 size={24} />
                    </span>

                    <h3>No consultations yet</h3>

                    <p>
                        Your uploaded consultation
                        videos will appear here.
                    </p>
                </div>
            ) : (
                <div className={styles.list}>
                    {consultations.map(
                        (consultation) => (
                            <article
                                className={
                                    styles.item
                                }
                                key={
                                    consultation.id
                                }
                            >
                                <span
                                    className={
                                        styles.videoIcon
                                    }
                                    aria-hidden="true"
                                >
                                    <FileVideo2
                                        size={20}
                                    />
                                </span>

                                <div
                                    className={
                                        styles.details
                                    }
                                >
                                    <strong>
                                        {consultation.title ||
                                            "Untitled consultation"}
                                    </strong>

                                    <span>
                                        Patient:{" "}
                                        {consultation.patientName ||
                                            "Not specified"}
                                    </span>
                                </div>

                                <div
                                    className={
                                        styles.date
                                    }
                                >
                                    <CalendarDays
                                        size={15}
                                    />

                                    <span>
                                        {formatDate(
                                            consultation.consultationDate
                                        )}
                                    </span>
                                </div>

                                <StatusBadge
                                    status={
                                        consultation.status
                                    }
                                />
                            </article>
                        )
                    )}
                </div>
            )}
        </section>
    );
}

export default RecentConsultations;