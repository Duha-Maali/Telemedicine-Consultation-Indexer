import { useEffect } from "react";
import { useDispatch } from "react-redux";

import {
    sessionCleared,
} from "../../../features/auth/authSlice";

function AuthSessionWatcher() {
    const dispatch = useDispatch();

    useEffect(() => {
        function handleUnauthorized() {
            dispatch(sessionCleared());
        }

        window.addEventListener(
            "tci:unauthorized",
            handleUnauthorized
        );

        return () => {
            window.removeEventListener(
                "tci:unauthorized",
                handleUnauthorized
            );
        };
    }, [dispatch]);

    return null;
}

export default AuthSessionWatcher;