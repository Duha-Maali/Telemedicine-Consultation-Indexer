import { useState } from "react";
import { Outlet } from "react-router-dom";

import Header from "../../components/DashboardLayout/Header/Header";
import Sidebar from "../../components/DashboardLayout/Sidebar/Sidebar";

import styles from "./DashboardLayout.module.css";

function DashboardLayout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className={styles.layout}>
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            <div className={styles.contentArea}>
                <Header onMenuClick={() => setIsSidebarOpen(true)} />

                <main className={styles.mainContent}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default DashboardLayout;
