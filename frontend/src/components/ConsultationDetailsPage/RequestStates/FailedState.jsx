import { CircleAlert, UploadCloud } from "lucide-react";
import { Link } from "react-router-dom";

import { ROUTES } from "../../../utils/constants";

import styles from "./StatusState.module.css";

function FailedState() {
    return (
        <section className={`${styles.panel} ${styles.failedPanel}`}>
            <span className={`${styles.heroIcon} ${styles.failedIcon}`}>
                <CircleAlert size={31} />
            </span>

            <span className={styles.eyebrow}>Processing stopped</span>
            <h2>We could not process this consultation</h2>
            <p>
                The worker was unable to prepare the uploaded video. The record remains
                available so you can review its information.
            </p>

            <div className={styles.actionRow}>
                <Link className={styles.primaryAction} to={ROUTES.UPLOAD_CONSULTATION}>
                    <UploadCloud size={17} />
                    Upload another consultation
                </Link>
                <Link className={styles.secondaryAction} to={ROUTES.CONSULTATIONS}>
                    Back to consultations
                </Link>
            </div>
        </section>
    );
}

export default FailedState;
