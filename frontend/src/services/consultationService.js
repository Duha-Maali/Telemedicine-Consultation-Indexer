import apiClient from "../utils/apiClient";

export async function getConsultations() {
    const response = await apiClient.get(
        "/consultations"
    );

    return response.data;
}

export async function createConsultation(
    payload,
    onProgress
) {
    const consultationDate = new Date(
        payload.consultationDate
    );

    if (
        Number.isNaN(
            consultationDate.getTime()
        )
    ) {
        throw new Error(
            "Enter a valid consultation date and time."
        );
    }

    const formData = new FormData();

    formData.append(
        "Title",
        payload.title
    );

    formData.append(
        "PatientName",
        payload.patientName
    );

    formData.append(
        "ConsultationDate",
        consultationDate.toISOString()
    );

    formData.append(
        "Video",
        payload.video
    );

    const response = await apiClient.post(
        "/consultations",
        formData,
        {
            timeout: 0,

            onUploadProgress: (
                progressEvent
            ) => {
                let percentage = 0;

                if (progressEvent.total) {
                    percentage = Math.round(
                        (progressEvent.loaded *
                            100) /
                            progressEvent.total
                    );
                } else if (
                    typeof progressEvent.progress ===
                    "number"
                ) {
                    percentage = Math.round(
                        progressEvent.progress * 100
                    );
                }

                onProgress?.(
                    Math.min(
                        Math.max(
                            percentage,
                            0
                        ),
                        99
                    )
                );
            },
        }
    );

    return response.data;
}