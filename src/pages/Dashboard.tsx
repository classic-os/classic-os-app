import { useEffect, useMemo, useState } from "react";
import type { ProtocolPosition } from "@/types/domain";
import { protocolRegistry } from "@/services/protocols/registry";
import PositionCard from "@/components/PositionCard";
import { useUIStore, type UIState } from "@/stores/uiStore";
import { useAccount } from "wagmi";
import ConnectButton from "@/components/ConnectButton";

export default function Dashboard() {
    const [positions, setPositions] = useState<ProtocolPosition[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const { address, isConnected } = useAccount();

    const selectedChainId = useUIStore((s: UIState) => s.selectedChainId);
    const showTestnets = useUIStore((s: UIState) => s.showTestnets);
    const setSelectedChainId = useUIStore((s: UIState) => s.setSelectedChainId);
    const toggleShowTestnets = useUIStore((s: UIState) => s.toggleShowTestnets);

    const chain = useMemo(() => protocolRegistry[selectedChainId], [selectedChainId]);

    const chainIds = useMemo(() => {
        void showTestnets;
        return Object.keys(protocolRegistry)
            .map((id) => Number(id))
            .filter((n) => Number.isFinite(n))
            .sort((a, b) => a - b);
    }, [showTestnets]);

    useEffect(() => {
        let cancelled = false;

        // If wallet isn't connected, we don't fetch positions.
        if (!isConnected || !address) {
            setIsLoading(false);
            setPositions([]);
            return;
        }

        setIsLoading(true);
        setPositions([]);

        const run = async () => {
            const services = Object.values(chain ?? {});
            const all = (await Promise.all(services.map((s) => s.getUserPositions(address as `0x${string}`)))).flat();

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
    }, [chain, address, isConnected]);

    return (
        <div style={{ padding: 16, fontFamily: "system-ui, sans-serif" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                    <h1 style={{ margin: 0 }}>Classic OS</h1>
                    <p style={{ marginTop: 6, color: "#555" }}>Dashboard (mock data)</p>
                </div>
                <ConnectButton />
            </div>

            <div style={{ marginBottom: 12 }}>
                <label>
                    Chain ID:&nbsp;
                    <select value={selectedChainId} onChange={(e) => setSelectedChainId(Number(e.target.value))}>
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

            {!isConnected ? (
                <p style={{ color: "#555" }}>Connect your wallet to view positions.</p>
            ) : isLoading ? (
                <p style={{ color: "#555" }}>Loading positions…</p>
            ) : positions.length === 0 ? (
                <p style={{ color: "#555" }}>No positions found (mock).</p>
            ) : (
                positions.map((p) => <PositionCard key={`${p.protocolId}-${p.chainId}`} position={p} />)
            )}
        </div>
    );
}
