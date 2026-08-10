import { useMemo, useState } from "react";
import { CircleAlert, LoaderCircle, LockKeyhole, Video } from "lucide-react";

import { getConsultationVideoUrl } from "../../../services/consultationService";

import styles from "./ConsultationVideoPlayer.module.css";

function ConsultationVideoPlayer({ consultationId, videoRef }) {
    const [playerState, setPlayerState] = useState("loading");
    const videoUrl = useMemo(
        () => getConsultationVideoUrl(consultationId),
        [consultationId]
    );


    return (
        <section className={styles.card} aria-labelledby="consultation-video-title">
            <div className={styles.cardHeader}>
                <div>
                    <span className={styles.headerIcon}>
                        <Video size={18} />
                    </span>
                    <div>
                        <h3 id="consultation-video-title">Consultation video</h3>
                        <p>Use the controls or select a search result to jump ahead.</p>
                    </div>
                </div>

                <span className={styles.privateBadge}>
                    <LockKeyhole size={14} />
                    Private
                </span>
            </div>

            <div className={styles.playerShell}>
                {playerState === "loading" && (
                    <div className={styles.loadingOverlay} role="status">
                        <LoaderCircle size={26} className={styles.spinning} />
                        <span>Preparing secure playback…</span>
                    </div>
                )}

                <video
                    ref={videoRef}
                    className={styles.video}
                    controls
                    playsInline
                    preload="metadata"
                    src={videoUrl}
                    onLoadStart={() => setPlayerState("loading")}
                    onLoadedMetadata={() => setPlayerState("ready")}
                    onCanPlay={() => setPlayerState("ready")}
                    onWaiting={() => setPlayerState("loading")}
                    onPlaying={() => setPlayerState("ready")}
                    onError={() => setPlayerState("error")}
                >
                    Your browser does not support HTML video playback.
                </video>
            </div>

            {playerState === "error" && (
                <div className={styles.errorMessage} role="alert">
                    <CircleAlert size={18} />
                    <div>
                        <strong>Video playback is unavailable</strong>
                        <span>
                            Sign out and sign in again, then retry. Also make sure the API
                            is running.
                        </span>
                    </div>
                </div>
            )}

            <p className={styles.helperText}>
                Playback is streamed in smaller ranges, so you can seek without loading the
                entire recording first.
            </p>
        </section>
    );
}

export default ConsultationVideoPlayer;
