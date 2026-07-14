import {
    createAsyncThunk,
    createSlice,
} from "@reduxjs/toolkit";

import {
    loginDoctor as loginDoctorRequest,
} from "../../services/authService";
import { logger } from "../../services/logger";
import {
    loadAuthSession,
    saveAuthSession,
} from "../../utils/authStorage";
import {
    getErrorMessage,
} from "../../utils/getErrorMessage";

const storedSession = loadAuthSession();

const initialState = {
    accessToken: storedSession?.accessToken ?? null,
    expiresAt: storedSession?.expiresAt ?? null,
    doctor: storedSession?.doctor ?? null,
    isAuthenticated: Boolean(storedSession),
    status: "idle",
    error: null,
};

export const loginDoctor = createAsyncThunk(
    "auth/loginDoctor",
    async (credentials, { rejectWithValue }) => {
        try {
            logger.info("Doctor login started");

            const response =
                await loginDoctorRequest(credentials);

            saveAuthSession(response);

            logger.info("Doctor login completed", {
                doctorId: response.doctor?.id,
            });

            return response;
        } catch (error) {
            logger.error("Doctor login failed", error);

            return rejectWithValue(
                getErrorMessage(error)
            );
        }
    }
);

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        authErrorCleared(state) {
            state.error = null;
        },

        sessionCleared(state) {
            state.accessToken = null;
            state.expiresAt = null;
            state.doctor = null;
            state.isAuthenticated = false;
            state.status = "idle";
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginDoctor.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(
                loginDoctor.fulfilled,
                (state, action) => {
                    state.status = "succeeded";
                    state.accessToken =
                        action.payload.accessToken;
                    state.expiresAt =
                        action.payload.expiresAt;
                    state.doctor =
                        action.payload.doctor;
                    state.isAuthenticated = true;
                }
            )
            .addCase(
                loginDoctor.rejected,
                (state, action) => {
                    state.status = "failed";
                    state.error =
                        action.payload ??
                        "Unable to sign in. Please try again.";
                }
            );
    },
});

export const {
    authErrorCleared,
    sessionCleared,
} = authSlice.actions;

export default authSlice.reducer;