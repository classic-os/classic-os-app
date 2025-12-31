import { useEffect, useMemo, useState } from "react";
import type { ProtocolPosition } from "@/types/domain";
import { protocolRegistry } from "@/services/protocols/registry";
import PositionCard from "@/components/PositionCard";
import { useUIStore, type UIState } from "@/stores/uiStore";

export default function Dashboard() {
    const [positions, setPositions] = useState<ProtocolPosition[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const address = "0x0000000000000000000000000000000000000000" as const;

    const selectedChainId = useUIStore((s: UIState) => s.selectedChainId);
    const showTestnets = useUIStore((s: UIState) => s.showTestnets);
    const setSelectedChainId = useUIStore((s: UIState) => s.setSelectedChainId);
    const toggleShowTestnets = useUIStore((s: UIState) => s.toggleShowTestnets);

    const chain = useMemo(() => protocolRegistry[selectedChainId], [selectedChainId]);

    const chainIds = useMemo(() => {
        // Filtering comes later once we have chain metadata (isTestnet).
        void showTestnets;

        return Object.keys(protocolRegistry)
            .map((id) => Number(id))
            .filter((n) => Number.isFinite(n))
            .sort((a, b) => a - b);
    }, [showTestnets]);

    useEffect(() => {
        let cancelled = false;

        setIsLoading(true);
        setPositions([]);

        const run = async () => {
            const services = Object.values(chain ?? {});
            const all = (await Promise.all(services.map((s) => s.getUserPositions(address)))).flat();

            if (!cancelled) {
                setPositions(all);
                setIsLoading(false);
            }
        };

        run().catch(() => {
            if (!cancelled) {
                setPositions([]);
                setIsLoading(false);
            }
        });

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

            {isLoading ? (
                <p style={{ color: "#555" }}>Loading positions…</p>
            ) : positions.length === 0 ? (
                <p style={{ color: "#555" }}>No positions found (mock).</p>
            ) : (
                positions.map((p) => (
                    <PositionCard key={`${p.protocolId}-${p.chainId}`} position={p} />
                ))
            )}
        </div>
    );
}
