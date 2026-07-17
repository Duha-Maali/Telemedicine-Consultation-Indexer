import { useEffect, useMemo, useState } from "react";
import {
    CheckCircle2,
    CircleAlert,
    Info,
    RefreshCw,
    UploadCloud,
    X,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";

import ConsultationsTable from "../../components/ConsultationsPage/ConsultationsTable/ConsultationsTable";
import DashboardSkeleton from "../../components/DashboardPage/DashboardSkeleton/DashboardSkeleton";
import ConfirmationDialog from "../../components/shared/ConfirmationDialog/ConfirmationDialog";
import {
    deleteConsultation,
    deleteStateReset,
    fetchConsultations,
} from "../../features/consultations/consultationsSlice";
import { CONSULTATION_STATUS, ROUTES } from "../../utils/constants";

import styles from "./ConsultationsPage.module.css";

function ConsultationsPage() {
    const dispatch = useDispatch();
    const location = useLocation();
    const navigate = useNavigate();
    const [deleteTargetId, setDeleteTargetId] = useState(null);
    const [actionFeedback, setActionFeedback] = useState(null);
    const {
        items,
        listStatus,
        listError,
        deleteStatus,
        deleteError,
        deleteErrorStatus,
        deletingConsultationId,
    } = useSelector((state) => state.consultations);

    const routeFeedback = useMemo(
        () =>
            location.state?.feedback ??
            (location.state?.successMessage
                ? {
                      type: "success",
                      title: "Upload received",
                      message: location.state.successMessage,
                  }
                : null),
        [location.state]
    );
    const visibleFeedback = actionFeedback ?? routeFeedback;
    const deleteTarget = items.find((item) => item.id === deleteTargetId) ?? null;
    const isDeleting = deleteStatus === "deleting";
    const deleteTargetIsProcessing =
        deleteTarget?.status === CONSULTATION_STATUS.PROCESSING;

    useEffect(() => {
        if (listStatus === "idle") {
            dispatch(fetchConsultations());
        }
    }, [dispatch, listStatus]);

    useEffect(() => {
        if (!visibleFeedback) {
            return undefined;
        }

        const timerId = window.setTimeout(() => {
            setActionFeedback(null);

            if (routeFeedback) {
                navigate(location.pathname, { replace: true, state: null });
            }
        }, 6000);

        return () => window.clearTimeout(timerId);
    }, [location.pathname, navigate, routeFeedback, visibleFeedback]);

    const sortedConsultations = useMemo(
        () =>
            [...items].sort(
                (first, second) =>
                    new Date(second.consultationDate).getTime() -
                    new Date(first.consultationDate).getTime()
            ),
        [items]
    );

    if (
        (listStatus === "idle" || listStatus === "loading") &&
        items.length === 0
    ) {
        return <DashboardSkeleton />;
    }

    function dismissFeedback() {
        setActionFeedback(null);

        if (routeFeedback) {
            navigate(location.pathname, { replace: true, state: null });
        }
    }

    function openDeleteDialog(consultationId) {
        dispatch(deleteStateReset());
        setDeleteTargetId(consultationId);
    }

    function closeDeleteDialog() {
        if (isDeleting) {
            return;
        }

        setDeleteTargetId(null);
        dispatch(deleteStateReset());
    }

    async function handleDeleteConsultation() {
        if (!deleteTarget || deleteTargetIsProcessing) {
            return;
        }

        const resultAction = await dispatch(
            deleteConsultation(deleteTarget.id)
        );

        if (deleteConsultation.fulfilled.match(resultAction)) {
            setDeleteTargetId(null);
            setActionFeedback({
                type: "success",
                title: "Consultation deleted",
                message:
                    "The consultation, video, and transcript data were removed.",
            });
            dispatch(deleteStateReset());
            return;
        }

        const responseStatus = resultAction.payload?.status;

        if (responseStatus === 404) {
            setDeleteTargetId(null);
            setActionFeedback({
                type: "info",
                title: "Consultation unavailable",
                message: "This consultation no longer exists.",
            });
            dispatch(deleteStateReset());
            dispatch(fetchConsultations());
            return;
        }

        if (responseStatus === 409) {
            dispatch(fetchConsultations());
        }
    }

    const feedbackClassName =
        visibleFeedback?.type === "info"
            ? styles.infoState
            : styles.successState;
    const FeedbackIcon =
        visibleFeedback?.type === "info" ? Info : CheckCircle2;
    const deleteDialogDescription = deleteTarget ? (
        <>
            This will permanently remove <strong>
                “{deleteTarget.title || "Untitled consultation"}”
            </strong>, its video, and all transcript data.
        </>
    ) : (
        "This consultation and all associated data will be permanently removed."
    );

    return (
        <div className={styles.page}>
            <section className={styles.pageHeader}>
                <div>
                    <span className={styles.eyebrow}>Library</span>
                    <h1>Consultations</h1>
                    <p>
                        Review all consultation records and their processing status.
                    </p>
                </div>

                <div className={styles.headerActions}>
                    <Link
                        className={styles.uploadButton}
                        to={ROUTES.UPLOAD_CONSULTATION}
                    >
                        <UploadCloud size={17} />
                        Upload consultation
                    </Link>

                    <button
                        className={styles.refreshButton}
                        type="button"
                        onClick={() => dispatch(fetchConsultations())}
                        disabled={listStatus === "loading"}
                    >
                        <RefreshCw
                            className={
                                listStatus === "loading" ? styles.spinning : ""
                            }
                            size={17}
                        />
                        Refresh
                    </button>
                </div>
            </section>

            {visibleFeedback && (
                <section className={feedbackClassName} role="status">
                    <FeedbackIcon size={20} />
                    <div>
                        <strong>{visibleFeedback.title}</strong>
                        <span>{visibleFeedback.message}</span>
                    </div>
                    <button
                        type="button"
                        onClick={dismissFeedback}
                        aria-label="Dismiss message"
                    >
                        <X size={17} />
                    </button>
                </section>
            )}

            {listError && (
                <section className={styles.errorState} role="alert">
                    <CircleAlert size={20} />
                    <div>
                        <strong>We could not load your consultations.</strong>
                        <span>{listError}</span>
                    </div>
                    <button
                        type="button"
                        onClick={() => dispatch(fetchConsultations())}
                    >
                        Try again
                    </button>
                </section>
            )}

            <ConsultationsTable
                consultations={sortedConsultations}
                deletingConsultationId={deletingConsultationId}
                onRequestDelete={openDeleteDialog}
            />

            <ConfirmationDialog
                isOpen={Boolean(deleteTargetId)}
                title="Delete consultation?"
                description={deleteDialogDescription}
                confirmLabel="Delete consultation"
                isConfirming={isDeleting}
                confirmDisabled={
                    deleteTargetIsProcessing || deleteErrorStatus === 409
                }
                error={deleteError}
                onConfirm={handleDeleteConsultation}
                onClose={closeDeleteDialog}
            />
        </div>
    );
}

export default ConsultationsPage;
