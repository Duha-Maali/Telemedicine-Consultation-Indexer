import apiClient from "../utils/apiClient";

export async function getConsultations() {
    const response = await apiClient.get("/consultations");
    return response.data;
}

export async function getConsultationById(consultationId) {
    const response = await apiClient.get(`/consultations/${consultationId}`);
    return response.data;
}

export async function getConsultationStatus(consultationId) {
    const response = await apiClient.get(`/consultations/${consultationId}/status`);
    return response.data;
}

export async function createConsultation(payload) {
    const formData = new FormData();
    
    formData.append("Title", payload.title);
    formData.append("PatientName", payload.patientName);
    formData.append("ConsultationDate", payload.consultationDate);
    formData.append("Video", payload.video);

    const response = await apiClient.post("/consultations", formData, {
        timeout: 0,
    });

    return response.data;
}

export async function deleteConsultation(consultationId) {
    await apiClient.delete(`/consultations/${consultationId}`);
}

export async function getConsultationVideoBlob(consultationId) {
    const response = await apiClient.get(`/consultations/${consultationId}/video`, {
        responseType: "blob",
    });
    
    return response.data;
}