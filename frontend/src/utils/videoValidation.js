import {
    VIDEO_VALIDATION,
} from "./constants";

export function getFileExtension(
    fileName = ""
) {
    const lastDotIndex =
        fileName.lastIndexOf(".");

    if (lastDotIndex < 0) {
        return "";
    }

    return fileName
        .slice(lastDotIndex)
        .toLowerCase();
}

export function validateVideoFile(file) {
    if (!file) {
        return "Select a consultation video.";
    }

    if (!(file instanceof File)) {
        return "The selected video is invalid.";
    }

    if (file.size <= 0) {
        return "The selected video is empty.";
    }

    if (
        file.size >
        VIDEO_VALIDATION.MAX_SIZE_BYTES
    ) {
        return "The video must be 1 GB or smaller.";
    }

    const extension =
        getFileExtension(file.name);

    if (
        !VIDEO_VALIDATION.ALLOWED_EXTENSIONS.includes(
            extension
        )
    ) {
        return "Choose an MP4, MOV, or MKV video.";
    }

    return true;
}

export function formatFileSize(sizeInBytes) {
    if (
        !Number.isFinite(sizeInBytes) ||
        sizeInBytes <= 0
    ) {
        return "0 bytes";
    }

    const units = [
        "bytes",
        "KB",
        "MB",
        "GB",
    ];

    const unitIndex = Math.min(
        Math.floor(
            Math.log(sizeInBytes) /
                Math.log(1024)
        ),
        units.length - 1
    );

    const value =
        sizeInBytes / 1024 ** unitIndex;

    const fractionDigits =
        unitIndex === 0 || value >= 100
            ? 0
            : 1;

    return `${value.toFixed(
        fractionDigits
    )} ${units[unitIndex]}`;
}