export const STORAGE_KEYS = {
    ACCESS_TOKEN: "tci_access_token",
    AUTH_USER: "tci_auth_user",
    TOKEN_EXPIRES_AT: "tci_token_expires_at",
};

export const ROUTES = {
    LOGIN: "/login",
    REGISTER: "/register",
    DASHBOARD: "/",
    CONSULTATIONS: "/consultations",
    UPLOAD_CONSULTATION: "/consultations/upload",
    CONSULTATION_DETAILS:
        "/consultations/:consultationId",
};

export function buildConsultationDetailsRoute(
    consultationId
) {
    return `/consultations/${consultationId}`;
}

export const CONSULTATION_STATUS = {
    PENDING: "Pending",
    PROCESSING: "Processing",
    COMPLETED: "Completed",
    FAILED: "Failed",
    DELETION_REQUESTED: "DeletionRequested",
};

export const CONSULTATION_STATUS_POLL_INTERVAL_MS =
    5000;

export const VIDEO_VALIDATION = {
    MAX_SIZE_BYTES: 1024 * 1024 * 1024,

    ALLOWED_EXTENSIONS: [
        ".mp4",
        ".mov",
        ".mkv",
    ],

    ALLOWED_CONTENT_TYPES: [
        "video/mp4",
        "video/quicktime",
        "video/x-matroska",
    ],

    ACCEPT:
        ".mp4,.mov,.mkv,video/mp4,video/quicktime,video/x-matroska",
};