import { useEffect, useState } from "react";
import type { ProtocolPosition } from "@/types/domain";
import { protocolRegistry } from "@/services/protocols/registry";
import PositionCard from "@/components/PositionCard";
import { DEFAULT_CHAIN_ID } from "@/config/runtime";


export default function Dashboard() {
    const [positions, setPositions] = useState<ProtocolPosition[]>([]);
    const address = "0x0000000000000000000000000000000000000000" as const;

    useEffect(() => {
        const run = async () => {
            const chain = protocolRegistry[DEFAULT_CHAIN_ID];
            const services = Object.values(chain ?? {});
            const all = (
                await Promise.all(services.map((s) => s.getUserPositions(address)))
            ).flat();
            setPositions(all);
        };
        run();
    }, []);

    return (
        <div style={{ padding: 16, fontFamily: "system-ui, sans-serif" }}>
            <h1 style={{ margin: 0 }}>Classic OS</h1>
            <p style={{ marginTop: 6, color: "#555" }}>Dashboard (mock data)</p>

            {positions.map((p) => (
                <PositionCard key={`${p.protocolId}-${p.chainId}`} position={p} />
            ))}
        </div>
    );
}
