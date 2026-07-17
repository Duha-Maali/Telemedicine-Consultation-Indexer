import styles from "./ConsultationDetailsSkeleton.module.css";

function ConsultationDetailsSkeleton() {
    return (
        <div className={styles.page} aria-label="Loading consultation details">
            <div className={`${styles.line} ${styles.backLine}`} />

            <section className={styles.header}>
                <div className={styles.icon} />
                <div className={styles.headerText}>
                    <div className={`${styles.line} ${styles.eyebrow}`} />
                    <div className={`${styles.line} ${styles.title}`} />
                    <div className={`${styles.line} ${styles.subtitle}`} />
                </div>
                <div className={`${styles.line} ${styles.badge}`} />
            </section>

            <div className={styles.grid}>
                <section className={styles.card}>
                    <div className={`${styles.line} ${styles.cardTitle}`} />
                    {Array.from({ length: 6 }, (_, index) => (
                        <div className={styles.detailRow} key={index}>
                            <div className={styles.detailIcon} />
                            <div>
                                <div className={`${styles.line} ${styles.label}`} />
                                <div className={`${styles.line} ${styles.value}`} />
                            </div>
                        </div>
                    ))}
                </section>

                <section className={styles.cardLarge}>
                    <div className={styles.heroIcon} />
                    <div className={`${styles.line} ${styles.cardEyebrow}`} />
                    <div className={`${styles.line} ${styles.largeTitle}`} />
                    <div className={`${styles.line} ${styles.paragraph}`} />
                    <div className={`${styles.line} ${styles.paragraphShort}`} />
                </section>
            </div>
        </div>
    );
}

export default ConsultationDetailsSkeleton;
