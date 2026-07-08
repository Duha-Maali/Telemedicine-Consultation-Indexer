export function getErrorMessage(error) {
    if (error?.response?.data?.detail) {
        return error.response.data.detail;
    }

    if (error?.response?.data?.title) {
        return error.response.data.title;
    }

    if (error?.message) {
        return error.message;
    }

    return "Something went wrong. Please try again.";
}