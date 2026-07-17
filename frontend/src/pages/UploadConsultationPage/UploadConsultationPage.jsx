import { useEffect } from "react";
import {
    ArrowLeft,
    UploadCloud,
} from "lucide-react";

import {
    useDispatch,
    useSelector,
} from "react-redux";

import {
    Link,
    useNavigate,
} from "react-router-dom";

import ConsultationUploadForm from "../../components/UploadConsultationPage/ConsultationUploadForm/ConsultationUploadForm";

import {
    uploadConsultation,
    uploadStateReset,
} from "../../features/consultations/consultationsSlice";

import {
    ROUTES,
} from "../../utils/constants";

import styles from "./UploadConsultationPage.module.css";

function UploadConsultationPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const {
        uploadStatus,
        uploadProgress,
        uploadError,
    } = useSelector(
        (state) => state.consultations
    );

    const isUploading =
        uploadStatus === "uploading";

    useEffect(() => {
        dispatch(uploadStateReset());

        return () => {
            dispatch(uploadStateReset());
        };
    }, [dispatch]);

    useEffect(() => {
        function warnBeforeLeaving(event) {
            if (!isUploading) {
                return;
            }

            event.preventDefault();
            event.returnValue = "";
        }

        window.addEventListener(
            "beforeunload",
            warnBeforeLeaving
        );

        return () => {
            window.removeEventListener(
                "beforeunload",
                warnBeforeLeaving
            );
        };
    }, [isUploading]);

    async function handleUpload(payload) {
        const resultAction =
            await dispatch(
                uploadConsultation(payload)
            );

        if (
            uploadConsultation.fulfilled.match(
                resultAction
            )
        ) {
            navigate(
                ROUTES.CONSULTATIONS,
                {
                    replace: true,
                }
            );
        }
    }

    return (
        <div className={styles.page}>
            <div
                className={
                    styles.breadcrumbRow
                }
            >
                <Link
                    to={ROUTES.CONSULTATIONS}
                >
                    <ArrowLeft size={16} />
                    Back to consultations
                </Link>
            </div>

            <section
                className={styles.pageHeader}
            >
                <div
                    className={styles.titleArea}
                >
                    <span
                        className={styles.icon}
                        aria-hidden="true"
                    >
                        <UploadCloud size={23} />
                    </span>

                    <div>
                        <span
                            className={
                                styles.eyebrow
                            }
                        >
                            New recording
                        </span>

                        <h1>
                            Upload a consultation
                        </h1>

                        <p>
                            Add the consultation
                            details and upload the
                            recorded video for secure
                            transcription and
                            indexing.
                        </p>
                    </div>
                </div>
            </section>

            <ConsultationUploadForm
                onSubmit={handleUpload}
                isUploading={isUploading}
                uploadProgress={
                    uploadProgress
                }
                serverError={uploadError}
            />
        </div>
    );
}

export default UploadConsultationPage;