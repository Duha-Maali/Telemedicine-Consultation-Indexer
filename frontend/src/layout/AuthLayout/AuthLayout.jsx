import { Clock3, Search, ShieldCheck } from "lucide-react";
import { Outlet } from "react-router-dom";

import BrandLogo from "../../components/shared/BrandLogo/BrandLogo";
import styles from "./AuthLayout.module.css";

const benefits = [
    {
        icon: Search,
        title: "Search conversations instantly",
        description: "Find the exact medical discussion without replaying the full consultation.",
    },
    {
        icon: Clock3,
        title: "Jump to the right moment",
        description: "Open the video directly at the timestamp returned by transcript search.",
    },
    {
        icon: ShieldCheck,
        title: "Private doctor workspace",
        description: "Access is protected and consultations stay scoped to their doctor.",
    },
];

function AuthLayout() {
    return (
        <main className={styles.layout}>
            <section className={styles.brandPanel} aria-label="Product introduction">
                <div className={styles.glowOne} />
                <div className={styles.glowTwo} />
                <div className={styles.gridPattern} />

                <div className={styles.brandContent}>
                    <BrandLogo light />

                    <div className={styles.hero}>
                        <span className={styles.badge}>AI-assisted consultation indexing</span>

                        <h2>Reach the important moment, not the replay button.</h2>

                        <p>
                            Upload long telemedicine consultations, let the system process them,
                            then search the medical conversation and continue from the exact timestamp.
                        </p>

                        <div className={styles.benefits}>
                            {benefits.map(({ icon: Icon, title, description }) => (
                                <article className={styles.benefit} key={title}>
                                    <span className={styles.benefitIcon}>
                                        <Icon size={18} aria-hidden="true" />
                                    </span>
                                    <div>
                                        <strong>{title}</strong>
                                        <small>{description}</small>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>

                    <p className={styles.securityNote}>Secure telemedicine workflow</p>
                </div>
            </section>

            <section className={styles.formPanel}>
                <div className={styles.mobileBrand}>
                    <BrandLogo compact />
                </div>

                <div className={styles.formViewport}>
                    <Outlet />
                </div>
            </section>
        </main>
    );
}

export default AuthLayout;
