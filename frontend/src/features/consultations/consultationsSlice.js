import {
    createAsyncThunk,
    createSlice,
} from "@reduxjs/toolkit";

import {
    createConsultation,
    getConsultations,
} from "../../services/consultationService";

import {
    logger,
} from "../../services/logger";

import {
    getErrorMessage,
    getUploadErrorMessage,
} from "../../utils/getErrorMessage";

const initialState = {
    items: [],

    listStatus: "idle",
    listError: null,

    uploadStatus: "idle",
    uploadProgress: 0,
    uploadError: null,
};

function toListItem(consultation) {
    return {
        id: consultation.id,
        title: consultation.title,
        patientName:
            consultation.patientName,
        consultationDate:
            consultation.consultationDate,
        status: consultation.status,
    };
}

function upsertConsultationItem(
    state,
    consultation
) {
    const listItem =
        toListItem(consultation);

    const existingIndex =
        state.items.findIndex(
            (item) =>
                item.id === consultation.id
        );

    if (existingIndex === -1) {
        state.items.unshift(listItem);
        return;
    }

    state.items[existingIndex] = {
        ...state.items[existingIndex],
        ...listItem,
    };
}

export const fetchConsultations =
    createAsyncThunk(
        "consultations/fetchConsultations",
        async (
            _,
            { rejectWithValue }
        ) => {
            try {
                logger.info(
                    "Consultations request started"
                );

                const consultations =
                    await getConsultations();

                logger.info(
                    "Consultations request completed",
                    {
                        count:
                            consultations.length,
                    }
                );

                return consultations;
            } catch (error) {
                logger.error(
                    "Consultations request failed",
                    error
                );

                return rejectWithValue(
                    getErrorMessage(error)
                );
            }
        }
    );

export const uploadConsultation =
    createAsyncThunk(
        "consultations/uploadConsultation",
        async (
            payload,
            {
                dispatch,
                rejectWithValue,
            }
        ) => {
            try {
                logger.info(
                    "Consultation upload started",
                    {
                        fileSize:
                            payload.video?.size,
                        fileType:
                            payload.video
                                ?.type ||
                            "unknown",
                    }
                );

                const consultation =
                    await createConsultation(
                        payload,
                        (progress) => {
                            dispatch(
                                uploadProgressChanged(
                                    progress
                                )
                            );
                        }
                    );

                logger.info(
                    "Consultation upload completed",
                    {
                        consultationId:
                            consultation.id,
                        status:
                            consultation.status,
                    }
                );

                return consultation;
            } catch (error) {
                logger.error(
                    "Consultation upload failed",
                    {
                        status:
                            error?.response
                                ?.status,
                        message:
                            error?.message,
                    }
                );

                return rejectWithValue(
                    getUploadErrorMessage(
                        error
                    )
                );
            }
        }
    );

const consultationsSlice =
    createSlice({
        name: "consultations",

        initialState,

        reducers: {
            uploadProgressChanged(
                state,
                action
            ) {
                state.uploadProgress =
                    action.payload;
            },

            uploadStateReset(state) {
                state.uploadStatus = "idle";
                state.uploadProgress = 0;
                state.uploadError = null;
            },

            consultationsCleared() {
                return {
                    ...initialState,
                };
            },
        },

        extraReducers: (builder) => {
            builder
                .addCase(
                    fetchConsultations.pending,
                    (state) => {
                        state.listStatus =
                            "loading";

                        state.listError =
                            null;
                    }
                )
                .addCase(
                    fetchConsultations.fulfilled,
                    (state, action) => {
                        state.listStatus =
                            "succeeded";

                        state.items =
                            action.payload;

                        state.listError =
                            null;
                    }
                )
                .addCase(
                    fetchConsultations.rejected,
                    (state, action) => {
                        state.listStatus =
                            "failed";

                        state.listError =
                            action.payload ??
                            "Unable to load consultations. Please try again.";
                    }
                )
                .addCase(
                    uploadConsultation.pending,
                    (state) => {
                        state.uploadStatus =
                            "uploading";

                        state.uploadProgress =
                            0;

                        state.uploadError =
                            null;
                    }
                )
                .addCase(
                    uploadConsultation.fulfilled,
                    (state, action) => {
                        state.uploadStatus =
                            "succeeded";

                        state.uploadProgress =
                            100;

                        state.uploadError =
                            null;

                        upsertConsultationItem(
                            state,
                            action.payload
                        );
                    }
                )
                .addCase(
                    uploadConsultation.rejected,
                    (state, action) => {
                        state.uploadStatus =
                            "failed";

                        state.uploadProgress =
                            0;

                        state.uploadError =
                            action.payload ??
                            "Unable to upload the consultation. Please try again.";
                    }
                );
        },
    });

export const {
    uploadProgressChanged,
    uploadStateReset,
    consultationsCleared,
} = consultationsSlice.actions;

export default consultationsSlice.reducer;