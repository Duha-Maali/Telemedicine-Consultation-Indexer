import { Stethoscope } from "lucide-react";

import styles from "./BrandLogo.module.css";

function BrandLogo({ compact = false, light = false }) {
    const className = [
        styles.logo,
        compact ? styles.compact : "",
        light ? styles.light : "",
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <div className={className} aria-label="Telemedicine Consultation Indexer">
            <span className={styles.icon} aria-hidden="true">
                <Stethoscope size={compact ? 21 : 25} strokeWidth={2.2} />
            </span>

            <span className={styles.text}>
                <strong>Telemedicine</strong>
                {!compact && <small>Consultation Indexer</small>}
            </span>
        </div>
    );
}

export default BrandLogo;
