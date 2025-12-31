import { useEffect, useMemo, useState } from "react";
import type { ProtocolPosition } from "@/types/domain";
import { protocolRegistry } from "@/services/protocols/registry";
import PositionCard from "@/components/PositionCard";
import { useUIStore } from "@/stores/uiStore";

export default function Dashboard() {
    const [positions, setPositions] = useState<ProtocolPosition[]>([]);
    const address = "0x0000000000000000000000000000000000000000" as const;

    const selectedChainId = useUIStore((s) => s.selectedChainId);
    const showTestnets = useUIStore((s) => s.showTestnets);
    const setSelectedChainId = useUIStore((s) => s.setSelectedChainId);
    const toggleShowTestnets = useUIStore((s) => s.toggleShowTestnets);

    const chain = useMemo(() => protocolRegistry[selectedChainId], [selectedChainId]);

    const chainIds = useMemo(() => {
        // For now we’re not filtering by showTestnets because we don’t have chain metadata.
        // We keep the flag in UI state so the UI is already wired for the next step.
        void showTestnets;

        return Object.keys(protocolRegistry)
            .map((id) => Number(id))
            .filter((n) => Number.isFinite(n))
            .sort((a, b) => a - b);
    }, [showTestnets]);

    useEffect(() => {
        let cancelled = false;

        // Prevent stale positions showing when switching chains
        setPositions([]);

        const run = async () => {
            const services = Object.values(chain ?? {});
            const all = (await Promise.all(services.map((s) => s.getUserPositions(address)))).flat();
            if (!cancelled) setPositions(all);
        };

        run();

        return () => {
            cancelled = true;
        };
    }, [chain, address]);

    return (
        <div style={{ padding: 16, fontFamily: "system-ui, sans-serif" }}>
            <h1 style={{ margin: 0 }}>Classic OS</h1>
            <p style={{ marginTop: 6, color: "#555" }}>Dashboard (mock data)</p>

            <div style={{ marginBottom: 12 }}>
                <label>
                    Chain ID:&nbsp;
                    <select
                        value={selectedChainId}
                        onChange={(e) => setSelectedChainId(Number(e.target.value))}
                    >
                        {chainIds.map((id) => (
                            <option key={id} value={id}>
                                {id}
                            </option>
                        ))}
                    </select>
                </label>

                <label style={{ marginLeft: 12 }}>
                    <input type="checkbox" checked={showTestnets} onChange={toggleShowTestnets} />
                    &nbsp;Show testnets
                </label>
            </div>

            {positions.map((p) => (
                <PositionCard key={`${p.protocolId}-${p.chainId}`} position={p} />
            ))}
        </div>
    );
}
