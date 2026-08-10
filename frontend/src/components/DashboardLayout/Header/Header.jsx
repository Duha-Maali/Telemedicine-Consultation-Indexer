import { Menu } from "lucide-react";
import { useSelector } from "react-redux";

import styles from "./Header.module.css";

function getInitials(doctor) {
    const firstInitial =
        doctor?.firstName?.trim()?.[0] ?? "";

    const lastInitial =
        doctor?.lastName?.trim()?.[0] ?? "";

    return (
        `${firstInitial}${lastInitial}`.toUpperCase() ||
        "DR"
    );
}

function Header({ onMenuClick }) {
    const doctor = useSelector(
        (state) => state.auth.doctor
    );

    return (
        <header className={styles.header}>
            <button
                className={styles.menuButton}
                type="button"
                onClick={onMenuClick}
                aria-label="Open navigation"
            >
                <Menu size={21} />
            </button>

            <div className={styles.workspaceLabel}>
                <span>Telemedicine workspace</span>
                <strong>
                    Consultation Indexer
                </strong>
            </div>

            <div className={styles.accountSummary}>
                <span className={styles.accountText}>
                    <strong>
                        Dr. {doctor?.firstName}{" "}
                        {doctor?.lastName}
                    </strong>

                    <small>Doctor account</small>
                </span>

                <span className={styles.avatar}>
                    {getInitials(doctor)}
                </span>
            </div>
        </header>
    );
}

export default Header;