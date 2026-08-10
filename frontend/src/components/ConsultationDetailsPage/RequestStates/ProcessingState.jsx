import { Check, Clock3, LoaderCircle, Search } from "lucide-react";

import { CONSULTATION_STATUS } from "../../../utils/constants";

import styles from "./StatusState.module.css";

function ProcessingState({ status }) {
    const isPending = status === CONSULTATION_STATUS.PENDING;

    return (
        <section className={`${styles.panel} ${styles.processingPanel}`}>
            <span className={`${styles.heroIcon} ${styles.processingIcon}`}>
                {isPending ? (
                    <Clock3 size={30} />
                ) : (
                    <LoaderCircle className={styles.spinning} size={30} />
                )}
            </span>

            <span className={styles.eyebrow}>
                {isPending ? "Waiting to start" : "Processing in progress"}
            </span>
            <h2>
                {isPending
                    ? "Your consultation is queued"
                    : "Preparing the consultation for search"}
            </h2>
            <p>
                {isPending
                    ? "The upload is complete and the processing worker will begin shortly."
                    : "The audio is being extracted, transcribed, and indexed. This can take several minutes for longer videos."}
            </p>

            <div className={styles.steps} aria-label="Processing progress">
                <div className={`${styles.step} ${styles.stepComplete}`}>
                    <span>
                        <Check size={15} />
                    </span>
                    <div>
                        <strong>Upload complete</strong>
                        <small>The video was stored securely.</small>
                    </div>
                </div>

                <div className={`${styles.step} ${styles.stepCurrent}`}>
                    <span>
                        {isPending ? <Clock3 size={15} /> : <LoaderCircle size={15} />}
                    </span>
                    <div>
                        <strong>
                            {isPending ? "Waiting for processing" : "Transcribing and indexing"}
                        </strong>
                        <small>The worker is preparing searchable segments.</small>
                    </div>
                </div>

                <div className={styles.step}>
                    <span>
                        <Search size={15} />
                    </span>
                    <div>
                        <strong>Ready for review</strong>
                        <small>Search becomes available after processing.</small>
                    </div>
                </div>
            </div>

            <div className={styles.helperNote}>
                You may leave this page and return later. The status updates automatically
                while this page remains open.
            </div>
        </section>
    );
}

export default ProcessingState;
