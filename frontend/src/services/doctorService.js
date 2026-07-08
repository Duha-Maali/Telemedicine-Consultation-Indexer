import apiClient from "./apiClient";

export async function getCurrentDoctor() {
    const response = await apiClient.get("/doctors/me");
    return response.data;
}