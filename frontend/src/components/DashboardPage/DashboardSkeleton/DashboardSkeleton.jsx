import styles from "./DashboardSkeleton.module.css";

function DashboardSkeleton() {
    return (
        <div className={styles.wrapper} aria-label="Loading dashboard" aria-live="polite">
            <div className={styles.header} />

            <div className={styles.grid}>
                {Array.from({ length: 4 }, (_, index) => (
                    <div className={styles.card} key={index} />
                ))}
            </div>

            <div className={styles.panel} />
        </div>
    );
}

export default DashboardSkeleton;
