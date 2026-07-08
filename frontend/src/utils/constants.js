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
    CONSULTATION_DETAILS: "/consultations/:consultationId",
};

export const CONSULTATION_STATUS = {
    PENDING: "Pending",
    PROCESSING: "Processing",
    COMPLETED: "Completed",
    FAILED: "Failed",
    DELETION_REQUESTED: "DeletionRequested",
};

export const VIDEO_VALIDATION = {
    MAX_SIZE_BYTES: 1024 * 1024 * 1024,
    ALLOWED_EXTENSIONS: [".mp4", ".webm", ".mov", ".mkv"],
    ALLOWED_CONTENT_TYPES: [
    "video/mp4",
    "video/webm",
    "video/quicktime",
    "video/x-matroska",
    ],
};