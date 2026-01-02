import { NavLink } from "react-router-dom";

function navLinkStyle({ isActive }: { isActive: boolean }) {
    return {
        fontWeight: isActive ? 600 : 400,
        textDecoration: "none",
    } as const;
}

export function Sidebar() {
    return (
        <aside
            style={{
                width: 220,
                padding: 16,
                display: "flex",
                borderRight: "1px solid #eee", // ← subtle structural divider
            }}
        >
            <nav
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    flex: 1,
                }}
            >
                <NavLink to="/" style={navLinkStyle}>
                    Portfolio
                </NavLink>
                <NavLink to="/swap" style={navLinkStyle}>
                    Swap
                </NavLink>
                <NavLink to="/lend" style={navLinkStyle}>
                    Lend / Borrow
                </NavLink>
                <NavLink to="/liquidity" style={navLinkStyle}>
                    Liquidity
                </NavLink>

                <hr />

                <a
                    href="https://launchpad.etcswap.org"
                    target="_blank"
                    rel="noreferrer"
                    style={{ textDecoration: "none" }}
                >
                    Token Launch
                </a>

                <a
                    href="https://brale.xyz"
                    target="_blank"
                    rel="noreferrer"
                    style={{ textDecoration: "none" }}
                >
                    Fiat Ramp
                </a>

                {/* Spacer for future footer / meta links */}
                <div style={{ flex: 1 }} />
            </nav>
        </aside>
    );
}