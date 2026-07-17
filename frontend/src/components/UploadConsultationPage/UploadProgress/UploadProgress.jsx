import { CloudUpload } from "lucide-react";

import styles from "./UploadProgress.module.css";

function UploadProgress({ progress }) {
    const normalizedProgress = Math.min(Math.max(progress, 0), 100);

    return (
        <div className={styles.card} aria-live="polite">
            <div className={styles.header}>
                <div className={styles.label}>
                    <span className={styles.icon} aria-hidden="true">
                        <CloudUpload size={18} />
                    </span>
                    <span>
                        <strong>Uploading consultation</strong>
                        <small>Please keep this page open.</small>
                    </span>
                </div>

                <strong className={styles.percentage}>{normalizedProgress}%</strong>
            </div>

            <div
                className={styles.track}
                role="progressbar"
                aria-label="Consultation upload progress"
                aria-valuemin="0"
                aria-valuemax="100"
                aria-valuenow={normalizedProgress}
            >
                <span
                    className={styles.progress}
                    style={{ width: `${normalizedProgress}%` }}
                />
            </div>
        </div>
    );
}

export default UploadProgress;
