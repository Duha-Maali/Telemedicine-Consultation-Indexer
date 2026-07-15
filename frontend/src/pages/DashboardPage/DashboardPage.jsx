import { useSelector } from "react-redux";

import styles from "./DashboardPage.module.css";

function DashboardPage() {
    const doctor = useSelector(
        (state) => state.auth.doctor
    );

    return (
        <div className={styles.page}>
            <section className={styles.pageHeader}>
                <div>
                    <span className={styles.eyebrow}>
                        Overview
                    </span>

                    <h1>
                        Welcome back, Dr.{" "}
                        {doctor?.firstName}
                    </h1>

                    <p>
                        Your secure telemedicine
                        workspace is ready.
                    </p>
                </div>
            </section>

            <section className={styles.welcomeCard}>
                <span className={styles.cardEyebrow}>
                    Consultation workspace
                </span>

                <h2>
                    Manage your consultations from
                    one place
                </h2>

                <p>
                    Upcoming features will allow you
                    to upload consultation videos,
                    monitor processing, and search
                    transcript segments.
                </p>
            </section>
        </div>
    );
}

export default DashboardPage;