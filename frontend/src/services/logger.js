const isDevelopment = import.meta.env.DEV;

function normalizePayload(payload) {
    if (!payload) {
        return undefined;
    }
    
    if (payload instanceof Error) {
        return {
            name: payload.name,
            message: payload.message,
            stack: payload.stack,
        };
    }

    return payload;
}

export const logger = {
    debug(message, payload) {
        if (isDevelopment) {
            console.debug(`[DEBUG] ${message}`, normalizePayload(payload));
        }
    },

    info(message, payload) {
        if (isDevelopment) {
            console.info(`[INFO] ${message}`, normalizePayload(payload));
        }
    },

    warn(message, payload) {
        console.warn(`[WARN] ${message}`, normalizePayload(payload));
    },

    error(message, payload) {
        console.error(`[ERROR] ${message}`, normalizePayload(payload));
    },
};