import { useRef, useState } from "react";
import { FileSearch2, ShieldCheck } from "lucide-react";

import ConsultationVideoPlayer from "../ConsultationVideoPlayer/ConsultationVideoPlayer";
import TranscriptSearch from "../TranscriptSearch/TranscriptSearch";

import styles from "./ConsultationReviewWorkspace.module.css";

function ConsultationReviewWorkspace({ consultationId }) {
    const videoRef = useRef(null);
    const [activeSegmentId, setActiveSegmentId] = useState(null);

    function handleResultSelect(segment) {
        const video = videoRef.current;

        if (!video) {
            return;
        }

        const startSeconds = Number(segment.startSeconds);

        if (Number.isFinite(startSeconds)) {
            video.currentTime = Math.max(0, startSeconds);
        }

        setActiveSegmentId(segment.id);
        video.focus();

        const playPromise = video.play();
        playPromise?.catch(() => {
            // Some browsers may still require the user to press play manually.
        });
    }

    return (
        <section className={styles.workspace} aria-labelledby="review-workspace-title">
            <header className={styles.header}>
                <div className={styles.headingGroup}>
                    <span className={styles.iconWrap}>
                        <FileSearch2 size={21} />
                    </span>
                    <div>
                        <span className={styles.eyebrow}>Consultation review</span>
                        <h2 id="review-workspace-title">Find the exact moment you need</h2>
                        <p>
                            Search the indexed transcript, then open the matching moment
                            directly in the recording.
                        </p>
                    </div>
                </div>

                <div className={styles.securityNote}>
                    <ShieldCheck size={17} />
                    <span>Protected doctor-only playback</span>
                </div>
            </header>

            <div className={styles.reviewGrid}>
                <ConsultationVideoPlayer
                    key={consultationId}
                    consultationId={consultationId}
                    videoRef={videoRef}
                />

                <TranscriptSearch
                    consultationId={consultationId}
                    activeSegmentId={activeSegmentId}
                    onResultSelect={handleResultSelect}
                />
            </div>
        </section>
    );
}

export default ConsultationReviewWorkspace;
