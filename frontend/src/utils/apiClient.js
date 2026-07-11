import axios from "axios";
import { STORAGE_KEYS } from "./constants";
import { logger } from "../services/logger";

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    timeout: 30000,
});

apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
        
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        logger.debug("API request started", {
            method: config.method,
            url: config.url,
        });
        
        return config;
    },
    
    (error) => {
        logger.error("API request error", error);
        return Promise.reject(error);
    }
);

apiClient.interceptors.response.use(
    (response) => {
        logger.debug("API response received", {
            url: response.config.url,
            status: response.status,
        });
        
        return response;
    },
    
    (error) => {
        logger.error("API response error", {
            url: error?.config?.url,
            status: error?.response?.status,
            data: error?.response?.data,
            message: error?.message,
        });
        
        if (error?.response?.status === 401) {
            localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
            localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
            localStorage.removeItem(STORAGE_KEYS.TOKEN_EXPIRES_AT);
        }
        
        return Promise.reject(error);
    }
);

export default apiClient;