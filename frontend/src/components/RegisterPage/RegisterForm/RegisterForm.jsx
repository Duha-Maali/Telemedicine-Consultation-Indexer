import { Mail, User, UserPlus } from "lucide-react";
import { useForm } from "react-hook-form";

import { AUTH_VALIDATION } from "../../../utils/validationRules";
import FormAlert from "../../shared/FormAlert/FormAlert";
import FormField from "../../shared/FormField/FormField";
import PasswordField from "../../shared/PasswordField/PasswordField";
import SubmitButton from "../../shared/SubmitButton/SubmitButton";
import styles from "./RegisterForm.module.css";

function RegisterForm({ onSubmit, isLoading, serverError }) {
    const {
        register,
        handleSubmit,
        getValues,
        formState: { errors },
    } = useForm({
        mode: "onBlur",
        reValidateMode: "onChange",
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
    });

    function submitForm(values) {
        onSubmit({
            firstName: values.firstName.trim(),
            lastName: values.lastName.trim(),
            email: values.email.trim(),
            password: values.password,
        });
    }

    return (
        <form className={styles.form} onSubmit={handleSubmit(submitForm)} noValidate>
            <div className={styles.row}>
                <FormField
                    id="register-first-name"
                    label="First name"
                    icon={User}
                    type="text"
                    autoComplete="given-name"
                    autoFocus
                    placeholder="First name"
                    error={errors.firstName?.message}
                    registration={register("firstName", {
                        validate: (value) =>
                            value.trim().length > 0 || "First name is required.",
                    })}
                />

                <FormField
                    id="register-last-name"
                    label="Last name"
                    icon={User}
                    type="text"
                    autoComplete="family-name"
                    placeholder="Last name"
                    error={errors.lastName?.message}
                    registration={register("lastName", {
                        validate: (value) =>
                            value.trim().length > 0 || "Last name is required.",
                    })}
                />
            </div>

            <FormField
                id="register-email"
                label="Email address"
                icon={Mail}
                type="email"
                autoComplete="email"
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

            <div className={styles.row}>
                <PasswordField
                    id="register-password"
                    label="Password"
                    autoComplete="new-password"
                    placeholder="Create password"
                    hint={`At least ${AUTH_VALIDATION.PASSWORD_MIN_LENGTH} characters.`}
                    error={errors.password?.message}
                    registration={register("password", {
                        required: "Password is required.",
                        minLength: {
                            value: AUTH_VALIDATION.PASSWORD_MIN_LENGTH,
                            message: `Password must contain at least ${AUTH_VALIDATION.PASSWORD_MIN_LENGTH} characters.`,
                        },
                    })}
                />

                <PasswordField
                    id="register-confirm-password"
                    label="Confirm password"
                    autoComplete="new-password"
                    placeholder="Repeat password"
                    error={errors.confirmPassword?.message}
                    registration={register("confirmPassword", {
                        required: "Confirm your password.",
                        validate: (value) =>
                            value === getValues("password") || "Passwords do not match.",
                    })}
                />
            </div>

            <FormAlert message={serverError} />

            <SubmitButton icon={UserPlus} isLoading={isLoading} loadingText="Creating account...">
                Create account
            </SubmitButton>
        </form>
    );
}

export default RegisterForm;
