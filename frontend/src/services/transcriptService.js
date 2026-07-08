import apiClient from "./apiClient";

export async function getConsultationTranscript(consultationId) {
    const response = await apiClient.get(`/consultations/${consultationId}/transcript`);
    return response.data;
}

export async function searchTranscript(consultationId, query) {
    const response = await apiClient.get(
        `/consultations/${consultationId}/transcript/search`,
        {
            params: { query },
        }
    );

    return response.data;
}