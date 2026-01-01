import { useEffect, useMemo, useState } from "react";
import type { ProtocolPosition } from "@/types/domain";
import { protocolRegistry } from "@/services/protocols/registry";
import PositionCard from "@/components/PositionCard";
import { useUIStore, type UIState } from "@/stores/uiStore";
import { useAccount } from "wagmi";
import ConnectButton from "@/components/ConnectButton";
import { CHAINS } from "@/constants/chains";
import { FEATURE_LIVE_READS } from "@/config/featureFlags";

export default function Dashboard() {
    const [positions, setPositions] = useState<ProtocolPosition[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const { address, isConnected } = useAccount();

    const selectedChainId = useUIStore((s: UIState) => s.selectedChainId);
    const showTestnets = useUIStore((s: UIState) => s.showTestnets);
    const setSelectedChainId = useUIStore((s: UIState) => s.setSelectedChainId);
    const toggleShowTestnets = useUIStore((s: UIState) => s.toggleShowTestnets);

    const chain = useMemo(() => protocolRegistry[selectedChainId], [selectedChainId]);

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

    useEffect(() => {
        let cancelled = false;

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
                    <p style={{ marginTop: 6, color: "#555" }}>
                        Dashboard ({FEATURE_LIVE_READS ? "live reads enabled" : "mock mode"})
                    </p>
                </div>
                <ConnectButton />
            </div>

            <div style={{ marginBottom: 12 }}>
                <label>
                    Chain:&nbsp;
                    <select
                        value={selectedChainId}
                        onChange={(e) => setSelectedChainId(Number(e.target.value))}
                    >
                        {chainOptions.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.name} ({c.id})
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
                <p style={{ color: "#555" }}>No positions found.</p>
            ) : (
                positions.map((p) => <PositionCard key={`${p.protocolId}-${p.chainId}`} position={p} />)
            )}
        </div>
    );
}
