import {
    CheckCircle2,
    FileSearch2,
    PlayCircle,
} from "lucide-react";

import styles from "./StatusState.module.css";

function CompletedState() {
    return (
        <section
            className={`${styles.panel} ${styles.completedPanel}`}
        >
            <span
                className={`${styles.heroIcon} ${styles.completedIcon}`}
            >
                <CheckCircle2 size={31} />
            </span>

            <span className={styles.eyebrow}>
                Processing complete
            </span>

            <h2>
                Your consultation is ready
            </h2>

            <p>
                The video was processed
                successfully and its transcript
                was indexed for review.
            </p>

            <div className={styles.readyGrid}>
                <div>
                    <span>
                        <PlayCircle size={18} />
                    </span>

                    <div>
                        <strong>
                            Video prepared
                        </strong>

                        <small>
                            The recording is ready
                            for secure playback.
                        </small>
                    </div>
                </div>

                <div>
                    <span>
                        <FileSearch2 size={18} />
                    </span>

                    <div>
                        <strong>
                            Transcript indexed
                        </strong>

                        <small>
                            Transcript search will
                            be connected in the next
                            feature.
                        </small>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default CompletedState;