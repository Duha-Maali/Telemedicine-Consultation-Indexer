import {
    CalendarCheck2,
    CalendarClock,
    Clock3,
    FileVideo2,
    UserRound,
} from "lucide-react";

import styles from "./ConsultationInfoCard.module.css";

const dateTimeFormatter = new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
});

function formatDateTime(value) {
    if (!value) {
        return "Not available";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Not available";
    }

    return dateTimeFormatter.format(date);
}

function formatDuration(seconds) {
    if (seconds === null || seconds === undefined || Number.isNaN(seconds)) {
        return "Available after processing";
    }

    const roundedSeconds = Math.max(0, Math.round(seconds));
    const hours = Math.floor(roundedSeconds / 3600);
    const minutes = Math.floor((roundedSeconds % 3600) / 60);
    const remainingSeconds = roundedSeconds % 60;

    if (hours > 0) {
        return `${hours}h ${minutes}m ${remainingSeconds}s`;
    }

    return `${minutes}m ${remainingSeconds}s`;
}

const details = [
    {
        key: "patient",
        label: "Patient",
        icon: UserRound,
        value: (consultation) => consultation.patientName || "Not specified",
    },
    {
        key: "consultationDate",
        label: "Consultation date",
        icon: CalendarClock,
        value: (consultation) => formatDateTime(consultation.consultationDate),
    },
    {
        key: "file",
        label: "Original video",
        icon: FileVideo2,
        value: (consultation) => consultation.originalFileName || "Not available",
    },
    {
        key: "duration",
        label: "Video duration",
        icon: Clock3,
        value: (consultation) => formatDuration(consultation.durationSeconds),
    },
    {
        key: "createdAt",
        label: "Uploaded",
        icon: CalendarCheck2,
        value: (consultation) => formatDateTime(consultation.createdAt),
    },
    {
        key: "completedAt",
        label: "Processing completed",
        icon: CalendarCheck2,
        value: (consultation) => formatDateTime(consultation.completedAt),
    },
];

function ConsultationInfoCard({ consultation }) {
    return (
        <section className={styles.card}>
            <div className={styles.header}>
                <span className={styles.eyebrow}>Record information</span>
                <h2>Consultation details</h2>
                <p>Key information associated with this uploaded consultation.</p>
            </div>

            <dl className={styles.detailsGrid}>
                {details.map((detail) => {
                    const Icon = detail.icon;

                    return (
                        <div className={styles.detailItem} key={detail.key}>
                            <span className={styles.detailIcon} aria-hidden="true">
                                <Icon size={17} />
                            </span>
                            <div>
                                <dt>{detail.label}</dt>
                                <dd>{detail.value(consultation)}</dd>
                            </div>
                        </div>
                    );
                })}
            </dl>
        </section>
    );
}

export default ConsultationInfoCard;
