import {
    createBrowserRouter,
    Navigate,
} from "react-router-dom";

import AuthLayout from "../layout/AuthLayout/AuthLayout";
import DashboardLayout from "../layout/DashboardLayout/DashboardLayout";
import DashboardPage from "../pages/DashboardPage/DashboardPage";
import LoginPage from "../pages/LoginPage/LoginPage";
import RegisterPage from "../pages/RegisterPage/RegisterPage";
import ConsultationsPage from "../pages/ConsultationsPage/ConsultationsPage";
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
                    {
                        path: ROUTES.REGISTER,
                        element: <RegisterPage />,
                    },
                ],
            },
        ],
    },
    {
        element: <ProtectedRoute />,
        children: [
            {
                element: <DashboardLayout />,
                children: [
                    {
                        path: ROUTES.DASHBOARD,
                        element: <DashboardPage />,
                    },
                    {
                        path: ROUTES.CONSULTATIONS,
                        element: <ConsultationsPage />,
                    },
                ],  
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