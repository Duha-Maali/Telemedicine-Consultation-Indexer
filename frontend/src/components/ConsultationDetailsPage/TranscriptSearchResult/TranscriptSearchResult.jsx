import { Clock3, Play } from "lucide-react";

import {
    formatTimestamp,
    formatTimestampRange,
} from "../../../utils/formatTimestamp";

import styles from "./TranscriptSearchResult.module.css";

function TranscriptSearchResult({ result, isActive, onSelect }) {
    return (
        <button
            className={`${styles.result} ${isActive ? styles.resultActive : ""}`}
            type="button"
            onClick={onSelect}
            aria-pressed={isActive}
            aria-label={`Play video from ${formatTimestamp(result.startSeconds)}`}
        >
            <span className={styles.resultTopRow}>
                <span className={styles.timestamp}>
                    <Play size={13} fill="currentColor" />
                    {formatTimestamp(result.startSeconds)}
                </span>

                <span className={styles.range}>
                    <Clock3 size={13} />
                    {formatTimestampRange(
                        result.startSeconds,
                        result.endSeconds
                    )}
                </span>
            </span>

            <span className={styles.text}>{result.text}</span>
            <span className={styles.actionLabel}>
                {isActive ? "Playing this moment" : "Jump to this moment"}
            </span>
        </button>
    );
}

export default TranscriptSearchResult;
