import { useState } from "react";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";

import styles from "./PasswordField.module.css";

function PasswordField({
    id,
    label,
    error,
    registration,
    hint,
    className = "",
    ...inputProps
}) {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <div className={`${styles.field} ${className}`}>
            <label className={styles.label} htmlFor={id}>
                {label}
            </label>

            <div className={styles.control}>
                <LockKeyhole className={styles.leadingIcon} size={18} aria-hidden="true" />

                <input
                    id={id}
                    type={isVisible ? "text" : "password"}
                    className={`${styles.input} ${error ? styles.invalid : ""}`}
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
                    {...inputProps}
                    {...registration}
                />

                <button
                    className={styles.toggle}
                    type="button"
                    onClick={() => setIsVisible((current) => !current)}
                    aria-label={isVisible ? "Hide password" : "Show password"}
                    aria-pressed={isVisible}
                >
                    {isVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
            </div>

            {error ? (
                <p id={`${id}-error`} className={styles.error} role="alert">
                    {error}
                </p>
            ) : (
                hint && (
                    <p id={`${id}-hint`} className={styles.hint}>
                        {hint}
                    </p>
                )
            )}
        </div>
    );
}

export default PasswordField;
