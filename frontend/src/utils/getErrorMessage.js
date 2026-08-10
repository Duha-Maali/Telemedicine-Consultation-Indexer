function getValidationMessages(responseData) {
    const errors = responseData?.errors;

    if (!errors || typeof errors !== "object") {
        return [];
    }

    const messages = Object.values(errors)
        .flatMap((value) => {
            if (Array.isArray(value)) {
                return value;
            }

            return typeof value === "string" ? [value] : [];
        })
        .filter(Boolean);

    return [...new Set(messages)];
}

export function getErrorMessage(error) {
    const responseData = error?.response?.data;

    const validationMessages =
        getValidationMessages(responseData);

    if (validationMessages.length > 0) {
        return validationMessages.join(" ");
    }

    if (responseData?.message) {
        return responseData.message;
    }

    if (responseData?.detail) {
        return responseData.detail;
    }

    if (responseData?.title) {
        return responseData.title;
    }

    if (error?.message) {
        return error.message;
    }

    return "Something went wrong. Please try again.";
}

export function getUploadErrorMessage(
    error
) {
    const status = error?.response?.status;

    if (status === 413) {
        return "The selected video is too large. Choose a file that is 1 GB or smaller.";
    }

    if (status === 429) {
        const retryAfter =
            error?.response?.headers?.[
                "retry-after"
            ];

        const waitMessage = retryAfter
            ? ` Try again after ${retryAfter}.`
            : " Please wait before trying again.";

        return `Too many upload attempts.${waitMessage}`;
    }

    if (status === 500) {
        return "We could not upload the consultation. Please try again.";
    }

    if (status === 503) {
        return "The processing service is temporarily unavailable. Please try again shortly.";
    }

    if (error?.code === "ERR_NETWORK") {
        return "We could not connect to the API. Check that the backend is running and try again.";
    }

    return getErrorMessage(error);
}