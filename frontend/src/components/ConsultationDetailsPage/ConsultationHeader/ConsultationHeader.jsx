import {
    ArrowLeft,
    CalendarDays,
    RefreshCw,
    Stethoscope,
    UserRound,
} from "lucide-react";

import { Link } from "react-router-dom";

import {
    ROUTES,
} from "../../../utils/constants";

import StatusBadge from "../../shared/StatusBadge/StatusBadge";

import styles from "./ConsultationHeader.module.css";

const dateTimeFormatter =
    new Intl.DateTimeFormat("en", {
        dateStyle: "medium",
        timeStyle: "short",
    });

function formatDateTime(value) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Date unavailable";
    }

    return dateTimeFormatter.format(date);
}

function ConsultationHeader({
    consultation,
    canRefreshStatus,
    isRefreshing,
    onRefreshStatus,
}) {
    return (
        <section className={styles.header}>
            <Link
                className={styles.backLink}
                to={ROUTES.CONSULTATIONS}
            >
                <ArrowLeft size={16} />
                Back to consultations
            </Link>

            <div className={styles.mainRow}>
                <div
                    className={
                        styles.titleGroup
                    }
                >
                    <span
                        className={styles.icon}
                        aria-hidden="true"
                    >
                        <Stethoscope
                            size={24}
                        />
                    </span>

                    <div
                        className={
                            styles.titleContent
                        }
                    >
                        <span
                            className={
                                styles.eyebrow
                            }
                        >
                            Consultation record
                        </span>

                        <h1>
                            {consultation.title ||
                                "Untitled consultation"}
                        </h1>

                        <div
                            className={
                                styles.metadata
                            }
                        >
                            <span>
                                <UserRound
                                    size={15}
                                />

                                {consultation.patientName ||
                                    "Patient not specified"}
                            </span>

                            <span>
                                <CalendarDays
                                    size={15}
                                />

                                {formatDateTime(
                                    consultation.consultationDate
                                )}
                            </span>
                        </div>
                    </div>
                </div>

                <div
                    className={styles.actions}
                >
                    <StatusBadge
                        status={
                            consultation.status
                        }
                    />

                    {canRefreshStatus && (
                        <button
                            className={
                                styles.refreshButton
                            }
                            type="button"
                            onClick={
                                onRefreshStatus
                            }
                            disabled={
                                isRefreshing
                            }
                        >
                            <RefreshCw
                                className={
                                    isRefreshing
                                        ? styles.spinning
                                        : ""
                                }
                                size={16}
                            />

                            Refresh status
                        </button>
                    )}
                </div>
            </div>
        </section>
    );
}

export default ConsultationHeader;