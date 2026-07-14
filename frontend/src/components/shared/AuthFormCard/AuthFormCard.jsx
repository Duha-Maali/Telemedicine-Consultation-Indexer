import styles from "./AuthFormCard.module.css";

function AuthFormCard({ eyebrow, title, description, children, footer }) {
    return (
        <section className={styles.card}>
            <header className={styles.header}>
                <span className={styles.eyebrow}>{eyebrow}</span>
                <h1>{title}</h1>
                <p>{description}</p>
            </header>

            {children}

            {footer && <footer className={styles.footer}>{footer}</footer>}
        </section>
    );
}

export default AuthFormCard;
