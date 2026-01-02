import { useMemo } from "react";
import { protocolRegistry } from "@/services/protocols/registry";
import { CHAINS } from "@/constants/chains";
import { useUIStore, type UIState } from "@/stores/uiStore";

function Toggle({
    checked,
    onChange,
    label,
}: {
    checked: boolean;
    onChange: () => void;
    label: string;
}) {
    // Simple, dependency-free "sliding" toggle.
    // Uses a real checkbox for accessibility, styled as a switch.
    return (
        <label style={{ display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
            <span style={{ fontSize: 12 }}>{label}</span>
            <span style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={onChange}
                    style={{
                        position: "absolute",
                        opacity: 0,
                        width: 1,
                        height: 1,
                        margin: 0,
                        padding: 0,
                    }}
                />
                <span
                    aria-hidden="true"
                    style={{
                        width: 36,
                        height: 20,
                        borderRadius: 999,
                        border: "1px solid #ccc",
                        background: checked ? "#111" : "#eee",
                        transition: "background 150ms ease",
                        display: "inline-flex",
                        alignItems: "center",
                        padding: 2,
                        boxSizing: "border-box",
                    }}
                >
                    <span
                        aria-hidden="true"
                        style={{
                            width: 16,
                            height: 16,
                            borderRadius: 999,
                            background: "#fff",
                            transform: checked ? "translateX(16px)" : "translateX(0px)",
                            transition: "transform 150ms ease",
                        }}
                    />
                </span>
            </span>
            <span style={{ fontSize: 12, color: "#555" }}>{checked ? "On" : "Off"}</span>
        </label>
    );
}

export function ChainSelector() {
    const selectedChainId = useUIStore((s: UIState) => s.selectedChainId);
    const showTestnets = useUIStore((s: UIState) => s.showTestnets);
    const setSelectedChainId = useUIStore((s: UIState) => s.setSelectedChainId);
    const toggleShowTestnets = useUIStore((s: UIState) => s.toggleShowTestnets);

    const chainOptions = useMemo(() => {
        const idsInRegistry = new Set(
            Object.keys(protocolRegistry)
                .map((id) => Number(id))
                .filter((n) => Number.isFinite(n))
        );

        return CHAINS
            .filter((c) => idsInRegistry.has(c.id))
            .filter((c) => showTestnets || !c.isTestnet)
            .sort((a, b) => a.id - b.id);
    }, [showTestnets]);

    return (
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <label style={{ display: "inline-flex", alignItems: "center" }}>
                <span style={{ fontSize: 12, marginRight: 6 }}>Chain:</span>
                <select value={selectedChainId} onChange={(e) => setSelectedChainId(Number(e.target.value))}>
                    {chainOptions.map((c) => (
                        <option key={c.id} value={c.id}>
                            {c.name}
                        </option>
                    ))}
                </select>
            </label>

            <Toggle checked={showTestnets} onChange={toggleShowTestnets} label="Testnets" />
        </div>
    );
}