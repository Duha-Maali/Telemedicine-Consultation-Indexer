import {
    createBrowserRouter,
    Navigate,
} from "react-router-dom";

import AuthLayout from "../layout/AuthLayout/AuthLayout";
import LoginPage from "../pages/LoginPage/LoginPage";
import { ROUTES } from "../utils/constants";
import ProtectedRoute from "./ProtectedRoute";
import PublicOnlyRoute from "./PublicOnlyRoute";

export const router = createBrowserRouter([
    {
        element: <PublicOnlyRoute />,
        children: [
            {
                element: <AuthLayout />,
                children: [
                    {
                        path: ROUTES.LOGIN,
                        element: <LoginPage />,
                    },
                ],
            },
        ],
    },
    {
        element: <ProtectedRoute />,
        children: [
            {
                path: ROUTES.DASHBOARD,
                element: (
                    <main style={{ padding: "3rem" }}>
                        <h1>
                            Signed in successfully
                        </h1>

                        <p>
                            The protected workspace
                            will be added in the next
                            features.
                        </p>
                    </main>
                ),
            },
        ],
    },
    {
        path: "*",
        element: (
            <Navigate
                to={ROUTES.DASHBOARD}
                replace
            />
        ),
    },
]);