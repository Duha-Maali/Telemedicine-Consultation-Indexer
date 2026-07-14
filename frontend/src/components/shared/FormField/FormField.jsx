import styles from "./FormField.module.css";

function FormField({
    id,
    label,
    icon: Icon,
    error,
    registration,
    className = "",
    ...inputProps
}) {
    return (
        <div className={`${styles.field} ${className}`}>
            <label className={styles.label} htmlFor={id}>
                {label}
            </label>

            <div className={styles.control}>
                {Icon && <Icon className={styles.icon} size={18} aria-hidden="true" />}

                <input
                    id={id}
                    className={`${styles.input} ${error ? styles.invalid : ""}`}
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? `${id}-error` : undefined}
                    {...inputProps}
                    {...registration}
                />
            </div>

            {error && (
                <p id={`${id}-error`} className={styles.error} role="alert">
                    {error}
                </p>
            )}
        </div>
    );
}

export default FormField;
