import { Controller, useForm } from "react-hook-form";
import {
    CalendarDays,
    FileText,
    ShieldCheck,
    UploadCloud,
    UserRound,
    Video,
} from "lucide-react";

import { validateVideoFile } from "../../../utils/videoValidation";
import FormAlert from "../../shared/FormAlert/FormAlert";
import FormField from "../../shared/FormField/FormField";
import SubmitButton from "../../shared/SubmitButton/SubmitButton";
import UploadProgress from "../UploadProgress/UploadProgress";
import VideoDropZone from "../VideoDropZone/VideoDropZone";

import styles from "./ConsultationUploadForm.module.css";

function getDefaultConsultationDate() {
    const now = new Date();
    const localTime = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);

    return localTime.toISOString().slice(0, 16);
}

function ConsultationUploadForm({
    onSubmit,
    isUploading,
    uploadProgress,
    serverError,
}) {
    const {
        control,
        register,
        handleSubmit,
        trigger,
        formState: { errors },
    } = useForm({
        mode: "onBlur",
        reValidateMode: "onChange",
        defaultValues: {
            title: "",
            patientName: "",
            consultationDate: getDefaultConsultationDate(),
            video: null,
        },
    });

    function submitForm(values) {
        onSubmit({
            title: values.title.trim(),
            patientName: values.patientName.trim(),
            consultationDate: values.consultationDate,
            video: values.video,
        });
    }

    return (
        <form
            className={styles.form}
            onSubmit={handleSubmit(submitForm)}
            noValidate
        >
            <fieldset className={styles.fieldset} disabled={isUploading}>
                <div className={styles.contentGrid}>
                    <section className={styles.section}>
                        <header className={styles.sectionHeader}>
                            <span className={styles.sectionIcon} aria-hidden="true">
                                <FileText size={20} />
                            </span>

                            <div>
                                <h2>Consultation information</h2>
                                <p>
                                    Add details that make this recording easy to
                                    identify later.
                                </p>
                            </div>
                        </header>

                        <div className={styles.fields}>
                            <FormField
                                id="consultation-title"
                                label="Consultation title"
                                icon={FileText}
                                type="text"
                                autoFocus
                                placeholder="e.g. Diabetes follow-up"
                                disabled={isUploading}
                                error={errors.title?.message}
                                registration={register("title", {
                                    validate: (value) =>
                                        value.trim().length > 0 ||
                                        "Consultation title is required.",
                                })}
                            />

                            <FormField
                                id="patient-name"
                                label="Patient name"
                                icon={UserRound}
                                type="text"
                                autoComplete="off"
                                placeholder="Enter the patient name"
                                disabled={isUploading}
                                error={errors.patientName?.message}
                                registration={register("patientName", {
                                    validate: (value) =>
                                        value.trim().length > 0 ||
                                        "Patient name is required.",
                                })}
                            />

                            <FormField
                                id="consultation-date"
                                label="Consultation date and time"
                                icon={CalendarDays}
                                type="datetime-local"
                                disabled={isUploading}
                                error={errors.consultationDate?.message}
                                registration={register("consultationDate", {
                                    required:
                                        "Consultation date and time are required.",
                                    validate: (value) =>
                                        !Number.isNaN(new Date(value).getTime()) ||
                                        "Enter a valid consultation date and time.",
                                })}
                            />
                        </div>
                    </section>

                    <section className={styles.section}>
                        <header className={styles.sectionHeader}>
                            <span className={styles.sectionIcon} aria-hidden="true">
                                <Video size={20} />
                            </span>

                            <div>
                                <h2>Consultation video</h2>
                                <p>
                                    Select the recording that will be transcribed and
                                    indexed.
                                </p>
                            </div>
                        </header>

                        <Controller
                            name="video"
                            control={control}
                            rules={{ validate: validateVideoFile }}
                            render={({ field, fieldState }) => (
                                <VideoDropZone
                                    file={field.value}
                                    error={fieldState.error?.message}
                                    disabled={isUploading}
                                    onChange={(file) => {
                                        field.onChange(file);
                                        void trigger("video");
                                    }}
                                />
                            )}
                        />
                    </section>
                </div>

                <div className={styles.securityNote}>
                    <ShieldCheck size={20} aria-hidden="true" />
                    <div>
                        <strong>Private doctor workspace</strong>
                        <span>
                            The recording is linked to your account and is processed
                            securely by the consultation worker.
                        </span>
                    </div>
                </div>

                {isUploading && <UploadProgress progress={uploadProgress} />}

                <FormAlert message={serverError} />

                <footer className={styles.footer}>
                    <p>
                        After upload, processing continues in the background and the
                        consultation will appear in your library.
                    </p>

                    <div className={styles.submitArea}>
                        <SubmitButton
                            icon={UploadCloud}
                            isLoading={isUploading}
                            loadingText="Uploading consultation..."
                        >
                            Upload consultation
                        </SubmitButton>
                    </div>
                </footer>
            </fieldset>
        </form>
    );
}

export default ConsultationUploadForm;
