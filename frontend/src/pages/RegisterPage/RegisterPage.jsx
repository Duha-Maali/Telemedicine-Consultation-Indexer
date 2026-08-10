import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";

import RegisterForm from "../../components/RegisterPage/RegisterForm/RegisterForm";
import AuthFormCard from "../../components/shared/AuthFormCard/AuthFormCard";
import { authErrorCleared, registerDoctor } from "../../features/auth/authSlice";
import { ROUTES } from "../../utils/constants";
import styles from "./RegisterPage.module.css";

function RegisterPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { status, error } = useSelector((state) => state.auth);
    const isLoading = status === "loading";

    useEffect(() => {
        dispatch(authErrorCleared());

        return () => {
            dispatch(authErrorCleared());
        };
    }, [dispatch]);

    async function handleRegister(payload) {
        const resultAction = await dispatch(registerDoctor(payload));

        if (registerDoctor.fulfilled.match(resultAction)) {
            navigate(ROUTES.DASHBOARD, { replace: true });
        }
    }

    return (
        <div className={styles.page}>
            <AuthFormCard
                eyebrow="Doctor registration"
                title="Create your secure workspace"
                description="Register once, then upload and search your telemedicine consultations from one private dashboard."
                footer={
                    <>
                        Already have an account?{" "}
                        <Link to={ROUTES.LOGIN}>Sign in</Link>
                    </>
                }
            >
                <RegisterForm
                    onSubmit={handleRegister}
                    isLoading={isLoading}
                    serverError={error}
                />
            </AuthFormCard>
        </div>
    );
}

export default RegisterPage;
