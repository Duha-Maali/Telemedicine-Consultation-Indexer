import apiClient from "./apiClient";

export async function loginDoctor(credentials) {
    const response = await apiClient.post("/auth/login", credentials);
    return response.data;
}

export async function registerDoctor(payload) {
    const response = await apiClient.post("/auth/register", payload);
    return response.data;
}