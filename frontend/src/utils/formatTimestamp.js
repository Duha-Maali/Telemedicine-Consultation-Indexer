export function formatTimestamp(totalSeconds) {
    const safeSeconds = Number.isFinite(Number(totalSeconds))
        ? Math.max(0, Math.floor(Number(totalSeconds)))
        : 0;

    const hours = Math.floor(safeSeconds / 3600);
    const minutes = Math.floor((safeSeconds % 3600) / 60);
    const seconds = safeSeconds % 60;

    if (hours > 0) {
        return [hours, minutes, seconds]
            .map((value) => String(value).padStart(2, "0"))
            .join(":");
    }

    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
        2,
        "0"
    )}`;
}

export function formatTimestampRange(startSeconds, endSeconds) {
    return `${formatTimestamp(startSeconds)} – ${formatTimestamp(endSeconds)}`;
}
