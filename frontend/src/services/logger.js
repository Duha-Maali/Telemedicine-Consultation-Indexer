const isDevelopment = import.meta.env.DEV;

function normalizePayload(payload) {
    if (payload === undefined || payload === null) {
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

function write(method, level, message, payload) {
    const normalizedPayload = normalizePayload(payload);
    const formattedMessage = `[${level}] ${message}`;

    if (normalizedPayload === undefined) {
        console[method](formattedMessage);
        return;
    }

    console[method](formattedMessage, normalizedPayload);
}

export const logger = {
    debug(message, payload) {
        if (isDevelopment) {
            write("debug", "DEBUG", message, payload);
        }
    },

    info(message, payload) {
        if (isDevelopment) {
            write("info", "INFO", message, payload);
        }
    },

    warn(message, payload) {
        write("warn", "WARN", message, payload);
    },

    error(message, payload) {
        write("error", "ERROR", message, payload);
    },
};
