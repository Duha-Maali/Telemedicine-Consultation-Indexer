import styles from "./StatCard.module.css";

function StatCard({
    label,
    value,
    helperText,
    icon: Icon,
    tone = "primary",
}) {
    return (
        <article className={styles.card}>
            <span
                className={`${styles.icon} ${styles[tone]}`}
                aria-hidden="true"
            >
                <Icon size={21} strokeWidth={2} />
            </span>

            <div className={styles.content}>
                <span>{label}</span>
                <strong>{value}</strong>
                <small>{helperText}</small>
            </div>
        </article>
    );
}

export default StatCard;