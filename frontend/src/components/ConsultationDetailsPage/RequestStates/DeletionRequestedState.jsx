import { Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

import { ROUTES } from "../../../utils/constants";

import styles from "./StatusState.module.css";

function DeletionRequestedState() {
    return (
        <section className={`${styles.panel} ${styles.deletionPanel}`}>
            <span className={`${styles.heroIcon} ${styles.deletionIcon}`}>
                <Trash2 size={30} />
            </span>

            <span className={styles.eyebrow}>Deletion requested</span>
            <h2>This consultation is being removed</h2>
            <p>
                Processing and review actions are unavailable while the consultation is
                scheduled for deletion.
            </p>

            <div className={styles.actionRow}>
                <Link className={styles.secondaryAction} to={ROUTES.CONSULTATIONS}>
                    Back to consultations
                </Link>
            </div>
        </section>
    );
}

export default DeletionRequestedState;
