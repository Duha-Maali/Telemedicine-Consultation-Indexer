import apiClient from "../utils/apiClient";

function getApiBaseUrl() {
    const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL || "/api";
    return configuredBaseUrl.replace(/\/$/, "");
}

export async function getConsultations() {
    const response = await apiClient.get("/consultations");
    return response.data;
}

export async function getConsultationById(consultationId, signal) {
    const response = await apiClient.get(`/consultations/${consultationId}`, {
        signal,
    });

    return response.data;
}

export async function getConsultationStatus(consultationId, signal) {
    const response = await apiClient.get(
        `/consultations/${consultationId}/status`,
        { signal }
    );

    return response.data;
}

export async function createConsultation(payload, onProgress) {
    const consultationDate = new Date(payload.consultationDate);

    if (Number.isNaN(consultationDate.getTime())) {
        throw new Error("Enter a valid consultation date and time.");
    }

    const formData = new FormData();

    formData.append("Title", payload.title);
    formData.append("PatientName", payload.patientName);
    formData.append("ConsultationDate", consultationDate.toISOString());
    formData.append("Video", payload.video);

    const response = await apiClient.post("/consultations", formData, {
        timeout: 0,
        onUploadProgress: (progressEvent) => {
            let percentage = 0;

            if (progressEvent.total) {
                percentage = Math.round(
                    (progressEvent.loaded * 100) / progressEvent.total
                );
            } else if (typeof progressEvent.progress === "number") {
                percentage = Math.round(progressEvent.progress * 100);
            }

            onProgress?.(Math.min(Math.max(percentage, 0), 99));
        },
    });

    return response.data;
}

export async function deleteConsultation(consultationId) {
    await apiClient.delete(`/consultations/${consultationId}`);
    return consultationId;
}

export function getConsultationVideoUrl(consultationId) {
    return `${getApiBaseUrl()}/consultations/${encodeURIComponent(
        consultationId
    )}/video`;
}
