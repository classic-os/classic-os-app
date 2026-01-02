import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

export function AppShell() {
    return (
        <div style={{ display: "flex", height: "100vh" }}>
            <Sidebar />
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                <TopBar />
                <main style={{ flex: 1, padding: 16 }}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
