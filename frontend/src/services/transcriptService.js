import apiClient from "../utils/apiClient";

export async function getConsultationTranscript(consultationId, signal) {
    const response = await apiClient.get(
        `/consultations/${consultationId}/transcript`,
        { signal }
    );

    return response.data;
}

export async function searchTranscript(consultationId, query, signal) {
    const response = await apiClient.get(
        `/consultations/${consultationId}/transcript/search`,
        {
            params: { query },
            signal,
        }
    );

    return response.data;
}
