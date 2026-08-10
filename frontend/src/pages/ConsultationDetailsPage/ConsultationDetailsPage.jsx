import { useEffect, useState } from "react";
import { CheckCircle2, CircleAlert, RefreshCw } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
    Link,
    useLocation,
    useNavigate,
    useParams,
} from "react-router-dom";

import CompletedState from "../../components/ConsultationDetailsPage/RequestStates/CompletedState";
import ConsultationDetailsSkeleton from "../../components/ConsultationDetailsPage/ConsultationDetailsSkeleton/ConsultationDetailsSkeleton";
import ConsultationHeader from "../../components/ConsultationDetailsPage/ConsultationHeader/ConsultationHeader";
import ConsultationInfoCard from "../../components/ConsultationDetailsPage/ConsultationInfoCard/ConsultationInfoCard";
import ConsultationReviewWorkspace from "../../components/ConsultationDetailsPage/ConsultationReviewWorkspace/ConsultationReviewWorkspace";
import DeletionRequestedState from "../../components/ConsultationDetailsPage/RequestStates/DeletionRequestedState";
import FailedState from "../../components/ConsultationDetailsPage/RequestStates/FailedState";
import ProcessingState from "../../components/ConsultationDetailsPage/RequestStates/ProcessingState";
import ConfirmationDialog from "../../components/shared/ConfirmationDialog/ConfirmationDialog";
import {
    clearSelectedConsultation,
    deleteConsultation,
    deleteStateReset,
    fetchConsultationById,
    fetchConsultations,
    fetchConsultationStatus,
} from "../../features/consultations/consultationsSlice";
import {
    CONSULTATION_STATUS,
    CONSULTATION_STATUS_POLL_INTERVAL_MS,
    ROUTES,
} from "../../utils/constants";

import styles from "./ConsultationDetailsPage.module.css";

const activeStatuses = new Set([
    CONSULTATION_STATUS.PENDING,
    CONSULTATION_STATUS.PROCESSING,
]);

function isActiveStatus(status) {
    return activeStatuses.has(status);
}

function ConsultationDetailsPage() {
    const dispatch = useDispatch();
    const location = useLocation();
    const navigate = useNavigate();
    const { consultationId } = useParams();
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const {
        selectedConsultation,
        detailsStatus,
        detailsError,
        detailsErrorStatus,
        statusRefreshStatus,
        statusPollingError,
        deleteStatus,
        deleteError,
        deleteErrorStatus,
    } = useSelector((state) => state.consultations);

    const uploadCompleted = location.state?.uploadCompleted === true;
    const isRefreshingStatus = statusRefreshStatus === "loading";
    const isDeleting = deleteStatus === "deleting";
    const currentStatus = selectedConsultation?.status;
    const shouldPoll = isActiveStatus(currentStatus);
    const canDelete = currentStatus !== CONSULTATION_STATUS.PROCESSING;

    useEffect(() => {
        dispatch(clearSelectedConsultation());
        dispatch(deleteStateReset());
        const request = dispatch(fetchConsultationById(consultationId));

        return () => {
            request.abort();
            dispatch(clearSelectedConsultation());
            dispatch(deleteStateReset());
        };
    }, [consultationId, dispatch]);

    useEffect(() => {
        if (!uploadCompleted) {
            return undefined;
        }

        const timerId = window.setTimeout(() => {
            navigate(location.pathname, { replace: true, state: null });
        }, 6000);

        return () => window.clearTimeout(timerId);
    }, [location.pathname, navigate, uploadCompleted]);

    useEffect(() => {
        if (!shouldPoll || !consultationId) {
            return undefined;
        }

        let cancelled = false;
        let timerId = null;
        let currentRequest = null;

        function clearScheduledPoll() {
            if (timerId !== null) {
                window.clearTimeout(timerId);
                timerId = null;
            }
        }

        function scheduleNextPoll(
            delay = CONSULTATION_STATUS_POLL_INTERVAL_MS
        ) {
            clearScheduledPoll();

            if (cancelled || document.visibilityState !== "visible") {
                return;
            }

            timerId = window.setTimeout(runPoll, delay);
        }

        async function runPoll() {
            if (cancelled || document.visibilityState !== "visible") {
                return;
            }

            currentRequest = dispatch(fetchConsultationStatus(consultationId));
            const resultAction = await currentRequest;
            currentRequest = null;

            if (cancelled || resultAction.meta?.aborted) {
                return;
            }

            if (fetchConsultationStatus.fulfilled.match(resultAction)) {
                const nextStatus = resultAction.payload.status;

                if (nextStatus === CONSULTATION_STATUS.COMPLETED) {
                    dispatch(fetchConsultationById(consultationId));
                }

                if (isActiveStatus(nextStatus)) {
                    scheduleNextPoll();
                }

                return;
            }

            const responseStatus = resultAction.payload?.status;
            const isRetryable =
                responseStatus === null ||
                responseStatus === undefined ||
                responseStatus === 429 ||
                responseStatus >= 500;

            if (isRetryable) {
                scheduleNextPoll();
            }
        }

        function handleVisibilityChange() {
            if (document.visibilityState === "visible") {
                clearScheduledPoll();
                runPoll();
                return;
            }

            clearScheduledPoll();
            currentRequest?.abort();
        }

        scheduleNextPoll();
        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            cancelled = true;
            clearScheduledPoll();
            currentRequest?.abort();
            document.removeEventListener(
                "visibilitychange",
                handleVisibilityChange
            );
        };
    }, [consultationId, dispatch, shouldPoll]);

    async function handleRefreshStatus() {
        const resultAction = await dispatch(
            fetchConsultationStatus(consultationId)
        );

        if (
            fetchConsultationStatus.fulfilled.match(resultAction) &&
            resultAction.payload.status === CONSULTATION_STATUS.COMPLETED
        ) {
            dispatch(fetchConsultationById(consultationId));
        }
    }

    function handleRetryDetails() {
        dispatch(fetchConsultationById(consultationId));
    }

    function openDeleteDialog() {
        dispatch(deleteStateReset());
        setIsDeleteDialogOpen(true);
    }

    function closeDeleteDialog() {
        if (isDeleting) {
            return;
        }

        setIsDeleteDialogOpen(false);
        dispatch(deleteStateReset());
    }

    async function handleDeleteConsultation() {
        if (!selectedConsultation || !canDelete) {
            return;
        }

        const resultAction = await dispatch(
            deleteConsultation(selectedConsultation.id)
        );

        if (deleteConsultation.fulfilled.match(resultAction)) {
            setIsDeleteDialogOpen(false);
            navigate(ROUTES.CONSULTATIONS, {
                replace: true,
                state: {
                    feedback: {
                        type: "success",
                        title: "Consultation deleted",
                        message:
                            "The consultation, video, and transcript data were removed.",
                    },
                },
            });
            return;
        }

        const responseStatus = resultAction.payload?.status;

        if (responseStatus === 404) {
            setIsDeleteDialogOpen(false);
            dispatch(fetchConsultations());
            navigate(ROUTES.CONSULTATIONS, {
                replace: true,
                state: {
                    feedback: {
                        type: "info",
                        title: "Consultation unavailable",
                        message: "This consultation no longer exists.",
                    },
                },
            });
            return;
        }

        if (responseStatus === 409) {
            dispatch(fetchConsultationById(selectedConsultation.id));
        }
    }

    if (!selectedConsultation && detailsStatus !== "failed") {
        return <ConsultationDetailsSkeleton />;
    }

    if (!selectedConsultation && detailsStatus === "failed") {
        const isNotFound = detailsErrorStatus === 404;

        return (
            <div className={styles.errorPage}>
                <span className={styles.errorIcon}>
                    <CircleAlert size={30} />
                </span>
                <span className={styles.errorEyebrow}>
                    {isNotFound ? "Record unavailable" : "Unable to load"}
                </span>
                <h1>
                    {isNotFound
                        ? "Consultation not found"
                        : "We could not load this consultation"}
                </h1>
                <p>
                    {detailsError ||
                        "The consultation could not be retrieved. Please try again."}
                </p>

                <div className={styles.errorActions}>
                    {!isNotFound && (
                        <button type="button" onClick={handleRetryDetails}>
                            <RefreshCw size={17} />
                            Try again
                        </button>
                    )}
                    <Link to={ROUTES.CONSULTATIONS}>Back to consultations</Link>
                </div>
            </div>
        );
    }

    function renderStatusContent() {
        switch (selectedConsultation.status) {
            case CONSULTATION_STATUS.PENDING:
            case CONSULTATION_STATUS.PROCESSING:
                return <ProcessingState status={selectedConsultation.status} />;
            case CONSULTATION_STATUS.COMPLETED:
                return <CompletedState />;
            case CONSULTATION_STATUS.FAILED:
                return <FailedState />;
            case CONSULTATION_STATUS.DELETION_REQUESTED:
                return <DeletionRequestedState />;
            default:
                return <ProcessingState status={CONSULTATION_STATUS.PENDING} />;
        }
    }

    const deleteDialogDescription = (
        <>
            This will permanently remove <strong>
                “{selectedConsultation.title || "Untitled consultation"}”
            </strong>, its video, and all transcript data.
        </>
    );

    return (
        <div className={styles.page}>
            <ConsultationHeader
                consultation={selectedConsultation}
                canRefreshStatus={shouldPoll}
                isRefreshing={isRefreshingStatus}
                onRefreshStatus={handleRefreshStatus}
                canDelete={canDelete}
                isDeleting={isDeleting}
                onDelete={openDeleteDialog}
            />

            {uploadCompleted && (
                <section className={styles.uploadNotice} role="status">
                    <CheckCircle2 size={20} />
                    <div>
                        <strong>Upload completed successfully</strong>
                        <span>
                            Processing has started. This page will update automatically.
                        </span>
                    </div>
                </section>
            )}

            {statusPollingError && shouldPoll && (
                <section className={styles.pollingNotice} role="status">
                    <CircleAlert size={19} />
                    <div>
                        <strong>Live status is temporarily unavailable</strong>
                        <span>
                            {statusPollingError} We will try again automatically.
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={handleRefreshStatus}
                        disabled={isRefreshingStatus}
                    >
                        Try now
                    </button>
                </section>
            )}

            <div className={styles.contentGrid}>
                <ConsultationInfoCard consultation={selectedConsultation} />
                {renderStatusContent()}
            </div>

            {selectedConsultation.status === CONSULTATION_STATUS.COMPLETED && (
                <ConsultationReviewWorkspace
                    consultationId={selectedConsultation.id}
                />
            )}

            <ConfirmationDialog
                isOpen={isDeleteDialogOpen}
                title="Delete consultation?"
                description={deleteDialogDescription}
                confirmLabel="Delete consultation"
                isConfirming={isDeleting}
                confirmDisabled={!canDelete || deleteErrorStatus === 409}
                error={deleteError}
                onConfirm={handleDeleteConsultation}
                onClose={closeDeleteDialog}
            />
        </div>
    );
}

export default ConsultationDetailsPage;
