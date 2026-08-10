import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";

import LoginForm from "../../components/LoginPage/LoginForm/LoginForm";
import AuthFormCard from "../../components/shared/AuthFormCard/AuthFormCard";
import { authErrorCleared, loginDoctor } from "../../features/auth/authSlice";
import { ROUTES } from "../../utils/constants";
import styles from "./LoginPage.module.css";

function LoginPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const { status, error } = useSelector((state) => state.auth);
    const isLoading = status === "loading";

    useEffect(() => {
        dispatch(authErrorCleared());

        return () => {
            dispatch(authErrorCleared());
        };
    }, [dispatch]);

    async function handleLogin(credentials) {
        const resultAction = await dispatch(loginDoctor(credentials));

        if (loginDoctor.fulfilled.match(resultAction)) {
            const destination = location.state?.from ?? ROUTES.DASHBOARD;
            navigate(destination, { replace: true });
        }
    }

    return (
        <div className={styles.page}>
            <AuthFormCard
                eyebrow="Welcome back"
                title="Sign in to your workspace"
                description="Access your consultations, monitor processing, and search the exact moment you need."
                footer={
                    <>
                        New to the platform?{" "}
                        <Link to={ROUTES.REGISTER}>Create an account</Link>
                    </>
                }
            >
                <LoginForm
                    onSubmit={handleLogin}
                    isLoading={isLoading}
                    serverError={error}
                />
            </AuthFormCard>
        </div>
    );
}

export default LoginPage;
