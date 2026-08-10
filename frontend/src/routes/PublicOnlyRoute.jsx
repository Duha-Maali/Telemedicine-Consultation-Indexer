import { useSelector } from "react-redux";
import {
    Navigate,
    Outlet,
} from "react-router-dom";

import { ROUTES } from "../utils/constants";

function PublicOnlyRoute() {
    const isAuthenticated = useSelector(
        (state) => state.auth.isAuthenticated
    );

    if (isAuthenticated) {
        return (
            <Navigate
                to={ROUTES.DASHBOARD}
                replace
            />
        );
    }

    return <Outlet />;
}

export default PublicOnlyRoute;