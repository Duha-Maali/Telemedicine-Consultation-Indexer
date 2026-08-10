import {
    CONSULTATION_STATUS,
} from "../../../utils/constants";

import styles from "./StatusBadge.module.css";

const statusLabels = {
    [CONSULTATION_STATUS.PENDING]: "Pending",
    [CONSULTATION_STATUS.PROCESSING]:
        "Processing",
    [CONSULTATION_STATUS.COMPLETED]:
        "Completed",
    [CONSULTATION_STATUS.FAILED]: "Failed",
    [CONSULTATION_STATUS.DELETION_REQUESTED]:
        "Deleting",
};

const statusClassNames = {
    [CONSULTATION_STATUS.PENDING]:
        styles.pending,
    [CONSULTATION_STATUS.PROCESSING]:
        styles.processing,
    [CONSULTATION_STATUS.COMPLETED]:
        styles.completed,
    [CONSULTATION_STATUS.FAILED]:
        styles.failed,
    [CONSULTATION_STATUS.DELETION_REQUESTED]:
        styles.deletionRequested,
};

function StatusBadge({ status }) {
    const label =
        statusLabels[status] ??
        status ??
        "Unknown";

    const statusClassName =
        statusClassNames[status] ??
        styles.unknown;

    return (
        <span
            className={`${styles.badge} ${statusClassName}`}
        >
            <span
                className={styles.dot}
                aria-hidden="true"
            />

            {label}
        </span>
    );
}

export default StatusBadge;