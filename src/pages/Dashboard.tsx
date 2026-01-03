// src/pages/Dashboard.tsx (or wherever Dashboard lives)
import { useEffect, useMemo, useRef, useState } from "react";
import type { ProtocolPosition } from "@/types/domain";
import { protocolRegistry } from "@/services/protocols/registry";
import PositionCard from "@/components/PositionCard";
import { useUIStore, type UIState } from "@/stores/uiStore";
import { useAccount } from "wagmi";
import { FEATURE_LIVE_READS } from "@/config/featureFlags";
import { CHAINS } from "@/constants/chains";

export function Dashboard() {
    const [positions, setPositions] = useState<ProtocolPosition[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const { address, isConnected } = useAccount();

    const selectedChainId = useUIStore((s: UIState) => s.selectedChainId);
    const showTestnets = useUIStore((s: UIState) => s.showTestnets);

    const chain = useMemo(() => protocolRegistry[selectedChainId], [selectedChainId]);

    const selectedChainName = useMemo(() => {
        const found = CHAINS.find((c) => c.id === selectedChainId);
        return found?.name ?? `Chain ${selectedChainId}`;
    }, [selectedChainId]);

    // ✅ request-id guard to prevent stale overwrites
    const requestIdRef = useRef(0);

    useEffect(() => {
        const requestId = ++requestIdRef.current;

        if (!isConnected || !address) {
            setIsLoading(false);
            setPositions([]);
            return;
        }

        setIsLoading(true);
        setPositions([]);

        const run = async () => {
            const services = Object.values(chain ?? {});
            const all = (await Promise.all(services.map((s) => s.getUserPositions(address)))).flat();

            // ✅ only commit if this is still the latest request
            if (requestIdRef.current === requestId) {
                setPositions(all);
                setIsLoading(false);
            }
        };

        run().catch(() => {
            if (requestIdRef.current === requestId) {
                setPositions([]);
                setIsLoading(false);
            }
        });
    }, [chain, address, isConnected]);

    return (
        <div style={{ padding: 16, fontFamily: "system-ui, sans-serif" }}>
            <div style={{ marginBottom: 12 }}>
                <h1 style={{ margin: 0, fontSize: 18 }}>Portfolio Overview</h1>
                <p style={{ marginTop: 6, color: "#555" }}>
                    {selectedChainName}
                    {showTestnets ? " (testnets visible)" : ""}
                    {" · "}
                    {FEATURE_LIVE_READS ? "live reads enabled" : "mock mode"}
                </p>
            </div>

            {!isConnected ? (
                <p style={{ color: "#555" }}>Connect your wallet to view positions.</p>
            ) : isLoading ? (
                <p style={{ color: "#555" }}>Loading positions…</p>
            ) : positions.length === 0 ? (
                <p style={{ color: "#555" }}>No positions found.</p>
            ) : (
                positions.map((p) => <PositionCard key={`${p.protocolId}-${p.chainId}`} position={p} />)
            )}
        </div>
    );
}
