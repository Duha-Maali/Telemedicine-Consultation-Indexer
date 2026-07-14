import { CircleAlert } from "lucide-react";

import styles from "./FormAlert.module.css";

function FormAlert({ message }) {
    if (!message) {
        return null;
    }

    return (
        <div className={styles.alert} role="alert" aria-live="polite">
            <CircleAlert size={18} aria-hidden="true" />
            <span>{message}</span>
        </div>
    );
}

export default FormAlert;
