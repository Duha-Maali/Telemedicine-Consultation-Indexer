import {
    LayoutDashboard,
    ListVideo,
    LogOut,
    UploadCloud,
    X,
} from "lucide-react";
import {
    useDispatch,
    useSelector,
} from "react-redux";
import { NavLink } from "react-router-dom";

import {
    logoutDoctor,
} from "../../../features/auth/authSlice";
import { ROUTES } from "../../../utils/constants";
import BrandLogo from "../../shared/BrandLogo/BrandLogo";
import styles from "./Sidebar.module.css";

const navigationItems = [
    {
        label: "Dashboard",
        to: ROUTES.DASHBOARD,
        icon: LayoutDashboard,
        end: true,
    },
    {
        label: "Upload consultation",
        to: ROUTES.UPLOAD_CONSULTATION,
        icon: UploadCloud,
        end: true,
    },
    {
        label: "Consultations",
        to: ROUTES.CONSULTATIONS,
        icon: ListVideo,
        end: true,
    },
];

function getInitials(doctor) {
    const firstInitial =
        doctor?.firstName?.trim()?.[0] ?? "";

    const lastInitial =
        doctor?.lastName?.trim()?.[0] ?? "";

    return (
        `${firstInitial}${lastInitial}`.toUpperCase() ||
        "DR"
    );
}

function Sidebar({ isOpen, onClose }) {
    const dispatch = useDispatch();

    const doctor = useSelector(
        (state) => state.auth.doctor
    );

    function handleLogout() {
        dispatch(logoutDoctor());
        onClose();
    }

    return (
        <>
            <div
                className={`${styles.overlay} ${
                    isOpen
                        ? styles.overlayVisible
                        : ""
                }`}
                onClick={onClose}
                aria-hidden="true"
            />

            <aside
                className={`${styles.sidebar} ${
                    isOpen
                        ? styles.sidebarOpen
                        : ""
                }`}
                aria-label="Primary navigation"
            >
                <div className={styles.brandRow}>
                    <BrandLogo />

                    <button
                        className={
                            styles.closeButton
                        }
                        type="button"
                        onClick={onClose}
                        aria-label="Close navigation"
                    >
                        <X size={20} />
                    </button>
                </div>

                <nav className={styles.navigation}>
                    <span
                        className={
                            styles.navigationLabel
                        }
                    >
                        Workspace
                    </span>

                    {navigationItems.map(
                        (item) => {
                            const Icon = item.icon;

                            return (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    end={item.end}
                                    className={({
                                        isActive,
                                    }) =>
                                        `${
                                            styles.navigationItem
                                        } ${
                                            isActive
                                                ? styles.navigationItemActive
                                                : ""
                                        }`
                                    }
                                    onClick={
                                        onClose
                                    }
                                >
                                    <Icon
                                        size={19}
                                        strokeWidth={2}
                                    />

                                    <span>
                                        {item.label}
                                    </span>
                                </NavLink>
                            );
                        }
                    )}
                </nav>

                <div className={styles.accountArea}>
                    <div
                        className={styles.doctorCard}
                    >
                        <span
                            className={styles.avatar}
                        >
                            {getInitials(doctor)}
                        </span>

                        <span
                            className={
                                styles.doctorDetails
                            }
                        >
                            <strong>
                                Dr.{" "}
                                {doctor?.firstName}{" "}
                                {doctor?.lastName}
                            </strong>

                            <small>
                                {doctor?.email}
                            </small>
                        </span>
                    </div>

                    <button
                        className={
                            styles.logoutButton
                        }
                        type="button"
                        onClick={handleLogout}
                    >
                        <LogOut size={18} />
                        Sign out
                    </button>
                </div>
            </aside>
        </>
    );
}

export default Sidebar;