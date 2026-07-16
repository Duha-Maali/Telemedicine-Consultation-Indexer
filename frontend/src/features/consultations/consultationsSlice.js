import {
    createAsyncThunk,
    createSlice,
} from "@reduxjs/toolkit";

import {
    getConsultations,
} from "../../services/consultationService";
import { logger } from "../../services/logger";
import {
    getErrorMessage,
} from "../../utils/getErrorMessage";

const initialState = {
    items: [],
    listStatus: "idle",
    listError: null,
};

export const fetchConsultations = createAsyncThunk(
    "consultations/fetchConsultations",
    async (_, { rejectWithValue }) => {
        try {
            logger.info(
                "Consultations request started"
            );

            const consultations =
                await getConsultations();

            logger.info(
                "Consultations request completed",
                {
                    count: consultations.length,
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

const consultationsSlice = createSlice({
    name: "consultations",
    initialState,
    reducers: {
        consultationsCleared() {
            return { ...initialState };
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(
                fetchConsultations.pending,
                (state) => {
                    state.listStatus = "loading";
                    state.listError = null;
                }
            )
            .addCase(
                fetchConsultations.fulfilled,
                (state, action) => {
                    state.listStatus = "succeeded";
                    state.items = action.payload;
                    state.listError = null;
                }
            )
            .addCase(
                fetchConsultations.rejected,
                (state, action) => {
                    state.listStatus = "failed";
                    state.listError =
                        action.payload ??
                        "Unable to load consultations. Please try again.";
                }
            );
    },
});

export const {
    consultationsCleared,
} = consultationsSlice.actions;

export default consultationsSlice.reducer;