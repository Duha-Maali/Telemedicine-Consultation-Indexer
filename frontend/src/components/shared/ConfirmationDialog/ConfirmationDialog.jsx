import { useEffect, useId, useRef } from "react";
import { AlertTriangle, LoaderCircle, X } from "lucide-react";

import styles from "./ConfirmationDialog.module.css";

function ConfirmationDialog({
    isOpen,
    title,
    description,
    warning = "This action cannot be undone.",
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    isConfirming = false,
    confirmDisabled = false,
    error = null,
    onConfirm,
    onClose,
}) {
    const dialogRef = useRef(null);
    const cancelButtonRef = useRef(null);
    const previouslyFocusedElementRef = useRef(null);
    const titleId = useId();
    const descriptionId = useId();

    useEffect(() => {
        const dialog = dialogRef.current;

        if (!dialog) {
            return undefined;
        }

        if (isOpen && !dialog.open) {
            previouslyFocusedElementRef.current = document.activeElement;
            dialog.showModal();
            document.body.style.overflow = "hidden";
            window.requestAnimationFrame(() => cancelButtonRef.current?.focus());
        }

        if (!isOpen && dialog.open) {
            dialog.close();
        }

        return () => {
            document.body.style.overflow = "";

            if (dialog.open) {
                dialog.close();
            }

            previouslyFocusedElementRef.current?.focus?.();
        };
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            return undefined;
        }

        document.body.style.overflow = "";
        previouslyFocusedElementRef.current?.focus?.();
        previouslyFocusedElementRef.current = null;

        return undefined;
    }, [isOpen]);

    function handleCancel(event) {
        event.preventDefault();

        if (!isConfirming) {
            onClose();
        }
    }

    function handleBackdropClick(event) {
        if (event.target === event.currentTarget && !isConfirming) {
            onClose();
        }
    }

    return (
        <dialog
            ref={dialogRef}
            className={styles.dialog}
            aria-labelledby={titleId}
            aria-describedby={descriptionId}
            onCancel={handleCancel}
            onClick={handleBackdropClick}
        >
            <div className={styles.panel}>
                <div className={styles.headingRow}>
                    <span className={styles.icon} aria-hidden="true">
                        <AlertTriangle size={22} />
                    </span>

                    <div className={styles.headingContent}>
                        <h2 id={titleId}>{title}</h2>
                        <div id={descriptionId} className={styles.description}>
                            {description}
                        </div>
                    </div>

                    <button
                        className={styles.closeButton}
                        type="button"
                        aria-label="Close confirmation dialog"
                        onClick={onClose}
                        disabled={isConfirming}
                    >
                        <X size={18} />
                    </button>
                </div>

                {warning && (
                    <p className={styles.warning}>
                        <AlertTriangle size={15} />
                        {warning}
                    </p>
                )}

                {error && (
                    <div className={styles.error} role="alert">
                        {error}
                    </div>
                )}

                <div className={styles.actions}>
                    <button
                        ref={cancelButtonRef}
                        className={styles.cancelButton}
                        type="button"
                        onClick={onClose}
                        disabled={isConfirming}
                    >
                        {cancelLabel}
                    </button>

                    <button
                        className={styles.confirmButton}
                        type="button"
                        onClick={onConfirm}
                        disabled={isConfirming || confirmDisabled}
                        aria-busy={isConfirming}
                    >
                        {isConfirming && (
                            <LoaderCircle
                                className={styles.spinning}
                                size={17}
                                aria-hidden="true"
                            />
                        )}
                        {isConfirming ? "Deleting..." : confirmLabel}
                    </button>
                </div>
            </div>
        </dialog>
    );
}

export default ConfirmationDialog;
