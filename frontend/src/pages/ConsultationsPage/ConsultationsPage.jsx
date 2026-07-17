import {
    useEffect,
    useMemo,
} from "react";
import {
    CircleAlert,
    RefreshCw,
    UploadCloud,
} from "lucide-react";
import {
    useDispatch,
    useSelector,
} from "react-redux";
import { Link } from "react-router-dom";
import {
    ROUTES,
} from "../../utils/constants";
import ConsultationsTable from "../../components/ConsultationsPage/ConsultationsTable/ConsultationsTable";
import DashboardSkeleton from "../../components/DashboardPage/DashboardSkeleton/DashboardSkeleton";
import {
    fetchConsultations,
} from "../../features/consultations/consultationsSlice";
import styles from "./ConsultationsPage.module.css";

function ConsultationsPage() {
    const dispatch = useDispatch();

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

    const sortedConsultations = useMemo(
        () =>
            [...items].sort(
                (first, second) =>
                    new Date(
                        second.consultationDate
                    ).getTime() -
                    new Date(
                        first.consultationDate
                    ).getTime()
            ),
        [items]
    );

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
                        Library
                    </span>

                    <h1>Consultations</h1>

                    <p>
                        Review all consultation
                        records and their processing
                        status.
                    </p>
                </div>

                <div className={styles.headerActions}>
                    <Link
                        className={styles.uploadButton}
                        to={ROUTES.UPLOAD_CONSULTATION}
                    >
                        <UploadCloud size={17} />
                        New consultation
                    </Link>

                    <button
                        className={styles.refreshButton}
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
                                listStatus === "loading"
                                    ? styles.spinning
                                    : ""
                            }
                            size={17}
                        />

                        Refresh
                    </button>
                </div>
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

            <ConsultationsTable
                consultations={
                    sortedConsultations
                }
            />
        </div>
    );
}

export default ConsultationsPage;