import { FileVideo2, RefreshCw, Trash2 } from "lucide-react";

import {
    formatFileSize,
    getFileExtension,
} from "../../../utils/videoValidation";

import styles from "./SelectedVideoCard.module.css";

function SelectedVideoCard({ file, disabled, onRemove, onReplace }) {
    const extension = getFileExtension(file.name).replace(".", "").toUpperCase();

    return (
        <div className={styles.card}>
            <div className={styles.fileIcon} aria-hidden="true">
                <FileVideo2 size={25} strokeWidth={1.9} />
            </div>

            <div className={styles.fileDetails}>
                <strong title={file.name}>{file.name}</strong>
                <span>
                    {extension || "Video"} video · {formatFileSize(file.size)}
                </span>
            </div>

            <div className={styles.actions}>
                <button
                    type="button"
                    onClick={onReplace}
                    disabled={disabled}
                    aria-label="Choose a different video"
                >
                    <RefreshCw size={16} />
                    <span>Replace</span>
                </button>

                <button
                    className={styles.removeButton}
                    type="button"
                    onClick={onRemove}
                    disabled={disabled}
                    aria-label="Remove selected video"
                >
                    <Trash2 size={16} />
                    <span>Remove</span>
                </button>
            </div>
        </div>
    );
}

export default SelectedVideoCard;
