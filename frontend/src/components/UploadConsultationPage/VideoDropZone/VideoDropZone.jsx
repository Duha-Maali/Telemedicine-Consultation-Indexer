import { useRef, useState } from "react";
import { UploadCloud } from "lucide-react";

import { VIDEO_VALIDATION } from "../../../utils/constants";
import SelectedVideoCard from "../SelectedVideoCard/SelectedVideoCard";

import styles from "./VideoDropZone.module.css";

function VideoDropZone({ file, error, disabled, onChange }) {
    const inputRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);

    function openFilePicker() {
        if (disabled) {
            return;
        }

        inputRef.current?.click();
    }

    function selectFile(fileList) {
        const selectedFile = fileList?.[0];

        if (selectedFile) {
            onChange(selectedFile);
        }
    }

    function handleInputChange(event) {
        selectFile(event.target.files);
    }

    function handleDragOver(event) {
        event.preventDefault();

        if (!disabled) {
            event.dataTransfer.dropEffect = "copy";
            setIsDragging(true);
        }
    }

    function handleDragLeave(event) {
        event.preventDefault();
        setIsDragging(false);
    }

    function handleDrop(event) {
        event.preventDefault();
        setIsDragging(false);

        if (!disabled) {
            selectFile(event.dataTransfer.files);
        }
    }

    function removeFile() {
        if (inputRef.current) {
            inputRef.current.value = "";
        }

        onChange(null);
    }

    return (
        <div className={styles.wrapper}>
            <input
                ref={inputRef}
                className={styles.hiddenInput}
                type="file"
                accept={VIDEO_VALIDATION.ACCEPT}
                onChange={handleInputChange}
                disabled={disabled}
                tabIndex={-1}
                aria-hidden="true"
            />

            {file ? (
                <SelectedVideoCard
                    file={file}
                    disabled={disabled}
                    onRemove={removeFile}
                    onReplace={openFilePicker}
                />
            ) : (
                <button
                    className={`${styles.dropZone} ${
                        isDragging ? styles.dragging : ""
                    } ${error ? styles.invalid : ""}`}
                    type="button"
                    onClick={openFilePicker}
                    onDragEnter={handleDragOver}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    disabled={disabled}
                    aria-describedby={error ? "video-upload-error" : "video-upload-help"}
                >
                    <span className={styles.uploadIcon} aria-hidden="true">
                        <UploadCloud size={28} strokeWidth={1.8} />
                    </span>

                    <span className={styles.primaryText}>
                        Drop your consultation video here
                    </span>

                    <span className={styles.secondaryText}>
                        or <strong>browse files</strong> from your device
                    </span>

                    <span id="video-upload-help" className={styles.helperText}>
                        MP4, MOV, or MKV · maximum file size 1 GB
                    </span>
                </button>
            )}

            {error && (
                <p id="video-upload-error" className={styles.error} role="alert">
                    {error}
                </p>
            )}
        </div>
    );
}

export default VideoDropZone;
