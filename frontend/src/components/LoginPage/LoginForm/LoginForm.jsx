import { LogIn, Mail } from "lucide-react";
import { useForm } from "react-hook-form";

import { AUTH_VALIDATION } from "../../../utils/validationRules";
import FormAlert from "../../shared/FormAlert/FormAlert";
import FormField from "../../shared/FormField/FormField";
import PasswordField from "../../shared/PasswordField/PasswordField";
import SubmitButton from "../../shared/SubmitButton/SubmitButton";
import styles from "./LoginForm.module.css";

function LoginForm({ onSubmit, isLoading, serverError }) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        mode: "onBlur",
        reValidateMode: "onChange",
        defaultValues: {
            email: "",
            password: "",
        },
    });

    function submitForm(values) {
        onSubmit({
            email: values.email.trim(),
            password: values.password,
        });
    }

    return (
        <form className={styles.form} onSubmit={handleSubmit(submitForm)} noValidate>
            <FormField
                id="login-email"
                label="Email address"
                icon={Mail}
                type="email"
                autoComplete="email"
                autoFocus
                placeholder="doctor@example.com"
                error={errors.email?.message}
                registration={register("email", {
                    required: "Email address is required.",
                    pattern: {
                        value: AUTH_VALIDATION.EMAIL_PATTERN,
                        message: "Enter a valid email address.",
                    },
                })}
            />

            <PasswordField
                id="login-password"
                label="Password"
                autoComplete="current-password"
                placeholder="Enter your password"
                error={errors.password?.message}
                registration={register("password", {
                    required: "Password is required.",
                })}
            />

            <FormAlert message={serverError} />

            <SubmitButton icon={LogIn} isLoading={isLoading} loadingText="Signing in...">
                Sign in
            </SubmitButton>
        </form>
    );
}

export default LoginForm;
