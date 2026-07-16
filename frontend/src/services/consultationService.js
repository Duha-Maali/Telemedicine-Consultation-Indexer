import apiClient from "../utils/apiClient";

export async function getConsultations() {
    const response = await apiClient.get(
        "/consultations"
    );

    return response.data;
}