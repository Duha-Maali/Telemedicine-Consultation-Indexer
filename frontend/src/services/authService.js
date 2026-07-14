import apiClient from "../utils/apiClient";

export async function loginDoctor(credentials) {
    const response = await apiClient.post("/auth/login", credentials);
    return response.data;
}