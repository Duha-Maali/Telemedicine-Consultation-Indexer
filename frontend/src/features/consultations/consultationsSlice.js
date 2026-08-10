import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import {
    createConsultation,
    deleteConsultation as deleteConsultationRequest,
    getConsultationById,
    getConsultations,
    getConsultationStatus,
} from "../../services/consultationService";
import { logger } from "../../services/logger";
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

    selectedConsultation: null,
    detailsStatus: "idle",
    detailsError: null,
    detailsErrorStatus: null,

    statusRefreshStatus: "idle",
    statusPollingError: null,

    deleteStatus: "idle",
    deleteError: null,
    deleteErrorStatus: null,
    deleteErrorCode: null,
    deletingConsultationId: null,
};

function toListItem(consultation) {
    return {
        id: consultation.id,
        title: consultation.title,
        patientName: consultation.patientName,
        consultationDate: consultation.consultationDate,
        status: consultation.status,
    };
}

function upsertConsultationItem(state, consultation) {
    const listItem = toListItem(consultation);
    const existingIndex = state.items.findIndex(
        (item) => item.id === consultation.id
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

function updateConsultationStatus(state, consultationId, status) {
    const item = state.items.find((consultation) => consultation.id === consultationId);

    if (item) {
        item.status = status;
    }
}

export const fetchConsultations = createAsyncThunk(
    "consultations/fetchConsultations",
    async (_, { rejectWithValue }) => {
        try {
            logger.info("Consultations request started");

            const consultations = await getConsultations();

            logger.info("Consultations request completed", {
                count: consultations.length,
            });

            return consultations;
        } catch (error) {
            logger.error("Consultations request failed", error);
            return rejectWithValue(getErrorMessage(error));
        }
    }
);

export const fetchConsultationById = createAsyncThunk(
    "consultations/fetchConsultationById",
    async (consultationId, { rejectWithValue, signal }) => {
        try {
            logger.info("Consultation details request started", {
                consultationId,
            });

            const consultation = await getConsultationById(
                consultationId,
                signal
            );

            logger.info("Consultation details request completed", {
                consultationId,
                status: consultation.status,
            });

            return consultation;
        } catch (error) {
            if (signal.aborted) {
                throw error;
            }

            logger.error("Consultation details request failed", {
                consultationId,
                status: error?.response?.status,
                message: error?.message,
            });

            return rejectWithValue({
                message: getErrorMessage(error),
                status: error?.response?.status ?? null,
            });
        }
    }
);

export const fetchConsultationStatus = createAsyncThunk(
    "consultations/fetchConsultationStatus",
    async (consultationId, { rejectWithValue, signal }) => {
        try {
            const statusResponse = await getConsultationStatus(
                consultationId,
                signal
            );

            return {
                consultationId,
                ...statusResponse,
            };
        } catch (error) {
            if (signal.aborted) {
                throw error;
            }

            logger.warn("Consultation status refresh failed", {
                consultationId,
                status: error?.response?.status,
                message: error?.message,
            });

            return rejectWithValue({
                message: getErrorMessage(error),
                status: error?.response?.status ?? null,
            });
        }
    }
);

export const uploadConsultation = createAsyncThunk(
    "consultations/uploadConsultation",
    async (payload, { dispatch, rejectWithValue }) => {
        try {
            logger.info("Consultation upload started", {
                fileSize: payload.video?.size,
                fileType: payload.video?.type || "unknown",
            });

            const consultation = await createConsultation(payload, (progress) => {
                dispatch(uploadProgressChanged(progress));
            });

            logger.info("Consultation upload completed", {
                consultationId: consultation.id,
                status: consultation.status,
            });

            return consultation;
        } catch (error) {
            logger.error("Consultation upload failed", {
                status: error?.response?.status,
                message: error?.message,
            });

            return rejectWithValue(getUploadErrorMessage(error));
        }
    }
);

export const deleteConsultation = createAsyncThunk(
    "consultations/deleteConsultation",
    async (consultationId, { rejectWithValue }) => {
        try {
            logger.info("Consultation deletion started", {
                consultationId,
            });

            await deleteConsultationRequest(consultationId);

            logger.info("Consultation deletion completed", {
                consultationId,
            });

            return consultationId;
        } catch (error) {
            const responseData = error?.response?.data;

            logger.error("Consultation deletion failed", {
                consultationId,
                status: error?.response?.status,
                code: responseData?.code,
                message: error?.message,
            });

            return rejectWithValue({
                consultationId,
                message: getErrorMessage(error),
                status: error?.response?.status ?? null,
                code: responseData?.code ?? null,
            });
        }
    }
);

const consultationsSlice = createSlice({
    name: "consultations",
    initialState,
    reducers: {
        uploadProgressChanged(state, action) {
            state.uploadProgress = action.payload;
        },
        uploadStateReset(state) {
            state.uploadStatus = "idle";
            state.uploadProgress = 0;
            state.uploadError = null;
        },
        deleteStateReset(state) {
            state.deleteStatus = "idle";
            state.deleteError = null;
            state.deleteErrorStatus = null;
            state.deleteErrorCode = null;
            state.deletingConsultationId = null;
        },
        clearSelectedConsultation(state) {
            state.selectedConsultation = null;
            state.detailsStatus = "idle";
            state.detailsError = null;
            state.detailsErrorStatus = null;
            state.statusRefreshStatus = "idle";
            state.statusPollingError = null;
        },
        consultationsCleared() {
            return { ...initialState };
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchConsultations.pending, (state) => {
                state.listStatus = "loading";
                state.listError = null;
            })
            .addCase(fetchConsultations.fulfilled, (state, action) => {
                state.listStatus = "succeeded";
                state.items = action.payload;
                state.listError = null;
            })
            .addCase(fetchConsultations.rejected, (state, action) => {
                state.listStatus = "failed";
                state.listError =
                    action.payload ??
                    "Unable to load consultations. Please try again.";
            })
            .addCase(fetchConsultationById.pending, (state) => {
                state.detailsStatus = "loading";
                state.detailsError = null;
                state.detailsErrorStatus = null;
            })
            .addCase(fetchConsultationById.fulfilled, (state, action) => {
                state.detailsStatus = "succeeded";
                state.selectedConsultation = action.payload;
                state.detailsError = null;
                state.detailsErrorStatus = null;
                upsertConsultationItem(state, action.payload);
            })
            .addCase(fetchConsultationById.rejected, (state, action) => {
                if (action.meta.aborted) {
                    return;
                }

                state.detailsStatus = "failed";
                state.detailsError =
                    action.payload?.message ??
                    "Unable to load this consultation. Please try again.";
                state.detailsErrorStatus = action.payload?.status ?? null;
            })
            .addCase(fetchConsultationStatus.pending, (state) => {
                state.statusRefreshStatus = "loading";
                state.statusPollingError = null;
            })
            .addCase(fetchConsultationStatus.fulfilled, (state, action) => {
                const { consultationId, status, completedAt } = action.payload;

                state.statusRefreshStatus = "succeeded";
                state.statusPollingError = null;

                if (state.selectedConsultation?.id === consultationId) {
                    state.selectedConsultation.status = status;
                    state.selectedConsultation.completedAt = completedAt;
                }

                updateConsultationStatus(state, consultationId, status);
            })
            .addCase(fetchConsultationStatus.rejected, (state, action) => {
                if (action.meta.aborted) {
                    state.statusRefreshStatus = "idle";
                    return;
                }

                const errorStatus = action.payload?.status ?? null;

                state.statusRefreshStatus = "failed";

                if (errorStatus === 404) {
                    state.selectedConsultation = null;
                    state.detailsStatus = "failed";
                    state.detailsError =
                        action.payload?.message ?? "Consultation not found.";
                    state.detailsErrorStatus = 404;
                    state.statusPollingError = null;
                    return;
                }

                state.statusPollingError =
                    action.payload?.message ??
                    "We could not refresh the processing status.";
            })
            .addCase(uploadConsultation.pending, (state) => {
                state.uploadStatus = "uploading";
                state.uploadProgress = 0;
                state.uploadError = null;
            })
            .addCase(uploadConsultation.fulfilled, (state, action) => {
                state.uploadStatus = "succeeded";
                state.uploadProgress = 100;
                state.uploadError = null;
                upsertConsultationItem(state, action.payload);
            })
            .addCase(uploadConsultation.rejected, (state, action) => {
                state.uploadStatus = "failed";
                state.uploadProgress = 0;
                state.uploadError =
                    action.payload ??
                    "Unable to upload the consultation. Please try again.";
            })
            .addCase(deleteConsultation.pending, (state, action) => {
                state.deleteStatus = "deleting";
                state.deleteError = null;
                state.deleteErrorStatus = null;
                state.deleteErrorCode = null;
                state.deletingConsultationId = action.meta.arg;
            })
            .addCase(deleteConsultation.fulfilled, (state, action) => {
                const consultationId = action.payload;

                state.deleteStatus = "succeeded";
                state.deleteError = null;
                state.deleteErrorStatus = null;
                state.deleteErrorCode = null;
                state.deletingConsultationId = null;
                state.items = state.items.filter(
                    (consultation) => consultation.id !== consultationId
                );

                if (state.selectedConsultation?.id === consultationId) {
                    state.selectedConsultation = null;
                }
            })
            .addCase(deleteConsultation.rejected, (state, action) => {
                state.deleteStatus = "failed";
                state.deleteError =
                    action.payload?.message ??
                    "Unable to delete the consultation. Please try again.";
                state.deleteErrorStatus = action.payload?.status ?? null;
                state.deleteErrorCode = action.payload?.code ?? null;
                state.deletingConsultationId = null;
            });
    },
});

export const {
    clearSelectedConsultation,
    deleteStateReset,
    consultationsCleared,
    uploadProgressChanged,
    uploadStateReset,
} = consultationsSlice.actions;

export default consultationsSlice.reducer;
