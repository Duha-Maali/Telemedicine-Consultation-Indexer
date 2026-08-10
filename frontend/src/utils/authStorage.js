import { STORAGE_KEYS } from "./constants";

export function saveAuthSession(authResponse) {
    const { accessToken, expiresAt, doctor } = authResponse;

    if (!accessToken || !expiresAt || !doctor) {
        throw new Error("The authentication response is incomplete.");
    }

    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    localStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRES_AT, expiresAt);
    localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(doctor));
}

export function clearAuthSession() {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.TOKEN_EXPIRES_AT);
    localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
}

export function loadAuthSession() {
    const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    const expiresAt = localStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRES_AT);
    const storedDoctor = localStorage.getItem(STORAGE_KEYS.AUTH_USER);

    if (!accessToken || !expiresAt || !storedDoctor) {
        clearAuthSession();
        return null;
    }

    const expirationTime = Date.parse(expiresAt);

    if (Number.isNaN(expirationTime) || expirationTime <= Date.now()) {
        clearAuthSession();
        return null;
    }

    try {
        return {
            accessToken,
            expiresAt,
            doctor: JSON.parse(storedDoctor),
        };
    } catch {
        clearAuthSession();
        return null;
    }
}
