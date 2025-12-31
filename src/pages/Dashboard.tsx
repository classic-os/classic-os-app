import { useEffect, useState } from "react";
import type { ProtocolPosition } from "@/types/domain";
import { protocolRegistry } from "@/services/protocols/registry";

export default function Dashboard() {
    const [positions, setPositions] = useState<ProtocolPosition[]>([]);
    const address = "0x0000000000000000000000000000000000000000" as const;

    useEffect(() => {
        const run = async () => {
            const chain = protocolRegistry[1];
            const services = Object.values(chain ?? {});
            const all = (await Promise.all(services.map((s) => s.getUserPositions(address)))).flat();
            setPositions(all);
        };
        run();
    }, []);

    return (
        <div style={{ padding: 16, fontFamily: "system-ui, sans-serif" }}>
            <h1 style={{ margin: 0 }}>Classic OS</h1>
            <p style={{ marginTop: 6, color: "#555" }}>Dashboard (mock data)</p>

            {positions.map((p) => (
                <div
                    key={`${p.protocolId}-${p.chainId}`}
                    style={{
                        border: "1px solid #ddd",
                        padding: 12,
                        borderRadius: 10,
                        marginTop: 12,
                    }}
                >
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <strong>{p.label}</strong>
                        <span style={{ color: "#666" }}>Chain {p.chainId}</span>
                    </div>

                    <div style={{ marginTop: 8 }}>
                        <div>
                            <strong>Net (USD):</strong> {p.netValueUsd ?? "-"}
                        </div>
                        <div>
                            <strong>Health Factor:</strong> {p.health?.healthFactor ?? "-"}
                        </div>
                    </div>

                    <div style={{ marginTop: 10 }}>
                        <strong>Supplied</strong>
                        <ul>
                            {(p.supplied ?? []).map((a) => (
                                <li key={`${a.token.address}-${a.token.symbol}`}>
                                    {a.token.symbol}: {a.raw.toString()} (raw)
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div style={{ marginTop: 10 }}>
                        <strong>Borrowed</strong>
                        <ul>
                            {(p.borrowed ?? []).map((a) => (
                                <li key={`${a.token.address}-${a.token.symbol}`}>
                                    {a.token.symbol}: {a.raw.toString()} (raw)
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            ))}
        </div>
    );
}
