import { Link } from "react-router-dom";
import ConnectButton from "@/components/ConnectButton";
import { ChainSelector } from "./ChainSelector";
import { useUIStore, type UIState } from "@/stores/uiStore";

export function TopBar() {
    const showTestnets = useUIStore((s: UIState) => s.showTestnets);

    return (
        <header
            style={{
                height: 48,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 16px",
                borderBottom: "1px solid #eee",
            }}
        >
            {/* Left: identity only */}
            <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
                <strong style={{ fontSize: 14, letterSpacing: 0.2 }}>Classic OS</strong>
            </Link>

            {/* Right: context + session */}
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <ChainSelector />

                {showTestnets ? (
                    <span style={{ fontSize: 12, color: "#555" }}>TESTNETS ON</span>
                ) : null}

                {/* reserved slot for future capability/status messaging */}
                <span style={{ fontSize: 12, color: "#999" }}>{/* status */}</span>

                <ConnectButton />
            </div>
        </header>
    );
}