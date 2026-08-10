import { LoaderCircle } from "lucide-react";

import styles from "./SubmitButton.module.css";

function SubmitButton({
    children,
    loadingText,
    isLoading,
    disabled = false,
    icon: Icon,
    className = "",
}) {
    return (
        <button
            className={`${styles.button} ${className}`}
            type="submit"
            disabled={isLoading || disabled}
            aria-busy={isLoading}
        >
            {isLoading ? (
                <>
                    <LoaderCircle className={styles.spinner} size={18} />
                    {loadingText}
                </>
            ) : (
                <>
                    {Icon && <Icon size={18} aria-hidden="true" />}
                    {children}
                </>
            )}
        </button>
    );
}

export default SubmitButton;
