import { configureStore } from "@reduxjs/toolkit";

import authReducer from "../features/auth/authSlice";
import consultationsReducer from "../features/consultations/consultationsSlice";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        consultations: consultationsReducer,
    },
});
