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

