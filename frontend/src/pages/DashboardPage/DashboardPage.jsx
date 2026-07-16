import {
    useEffect,
    useMemo,
} from "react";
import {
    CheckCircle2,
    CircleAlert,
    Clock3,
    Files,
    RefreshCw,
} from "lucide-react";
import {
    useDispatch,
    useSelector,
} from "react-redux";

import DashboardSkeleton from "../../components/DashboardPage/DashboardSkeleton/DashboardSkeleton";
import RecentConsultations from "../../components/DashboardPage/RecentConsultations/RecentConsultations";
import StatCard from "../../components/DashboardPage/StatCard/StatCard";
import {
    fetchConsultations,
} from "../../features/consultations/consultationsSlice";
import {
    CONSULTATION_STATUS,
} from "../../utils/constants";
import styles from "./DashboardPage.module.css";

function DashboardPage() {
    const dispatch = useDispatch();

    const doctor = useSelector(
        (state) => state.auth.doctor
    );

    const {
        items,
        listStatus,
        listError,
    } = useSelector(
        (state) => state.consultations
    );

    useEffect(() => {
        if (listStatus === "idle") {
            dispatch(fetchConsultations());
        }
    }, [dispatch, listStatus]);

    const dashboardData = useMemo(() => {
        const sortedConsultations = [
            ...items,
        ].sort(
            (first, second) =>
                new Date(
                    second.consultationDate
                ).getTime() -
                new Date(
                    first.consultationDate
                ).getTime()
        );

        const inProgressCount =
            items.filter(
                (consultation) =>
                    consultation.status ===
                        CONSULTATION_STATUS.PENDING ||
                    consultation.status ===
                        CONSULTATION_STATUS.PROCESSING
            ).length;

        return {
            total: items.length,

            inProgress: inProgressCount,

            completed: items.filter(
                (consultation) =>
                    consultation.status ===
                    CONSULTATION_STATUS.COMPLETED
            ).length,

            failed: items.filter(
                (consultation) =>
                    consultation.status ===
                    CONSULTATION_STATUS.FAILED
            ).length,

            recent:
                sortedConsultations.slice(0, 5),
        };
    }, [items]);

    const isInitialLoading =
        (listStatus === "idle" ||
            listStatus === "loading") &&
        items.length === 0;

    if (isInitialLoading) {
        return <DashboardSkeleton />;
    }

    return (
        <div className={styles.page}>
            <section
                className={styles.pageHeader}
            >
                <div>
                    <span
                        className={styles.eyebrow}
                    >
                        Overview
                    </span>

                    <h1>
                        Welcome back, Dr.{" "}
                        {doctor?.firstName}
                    </h1>

                    <p>
                        Track consultation
                        processing and review your
                        latest records.
                    </p>
                </div>

                <button
                    className={
                        styles.refreshButton
                    }
                    type="button"
                    onClick={() =>
                        dispatch(
                            fetchConsultations()
                        )
                    }
                    disabled={
                        listStatus === "loading"
                    }
                >
                    <RefreshCw
                        className={
                            listStatus ===
                            "loading"
                                ? styles.spinning
                                : ""
                        }
                        size={17}
                    />

                    Refresh
                </button>
            </section>

            {listError && (
                <section
                    className={styles.errorState}
                    role="alert"
                >
                    <CircleAlert size={20} />

                    <div>
                        <strong>
                            We could not load your
                            consultations.
                        </strong>

                        <span>{listError}</span>
                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            dispatch(
                                fetchConsultations()
                            )
                        }
                    >
                        Try again
                    </button>
                </section>
            )}

            <section
                className={styles.statsGrid}
                aria-label="Consultation summary"
            >
                <StatCard
                    label="Total consultations"
                    value={dashboardData.total}
                    helperText="All uploaded records"
                    icon={Files}
                    tone="primary"
                />

                <StatCard
                    label="In progress"
                    value={
                        dashboardData.inProgress
                    }
                    helperText="Pending or processing"
                    icon={Clock3}
                    tone="info"
                />

                <StatCard
                    label="Completed"
                    value={
                        dashboardData.completed
                    }
                    helperText="Ready to search"
                    icon={CheckCircle2}
                    tone="success"
                />

                <StatCard
                    label="Failed"
                    value={dashboardData.failed}
                    helperText="Needs your attention"
                    icon={CircleAlert}
                    tone="danger"
                />
            </section>

            <RecentConsultations
                consultations={
                    dashboardData.recent
                }
            />
        </div>
    );
}

export default DashboardPage;