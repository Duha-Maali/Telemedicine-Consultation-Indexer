import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import {
    RouterProvider,
} from "react-router-dom";

import { store } from "./app/store";
import AuthSessionWatcher from "./components/shared/AuthSessionWatcher/AuthSessionWatcher";
import { router } from "./routes/router";
import "./styles/global.css";

ReactDOM.createRoot(
    document.getElementById("root")
).render(
    <React.StrictMode>
        <Provider store={store}>
            <AuthSessionWatcher />
            <RouterProvider router={router} />
        </Provider>
    </React.StrictMode>
);