import type { ProtocolPosition } from "@/types/domain";

export default function PositionCard({ position }: { position: ProtocolPosition }) {
    return (
        <div
            style={{
                border: "1px solid #ddd",
                padding: 12,
                borderRadius: 10,
                marginTop: 12,
            }}
        >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
                <strong>{position.label}</strong>
                <span style={{ color: "#666" }}>Chain {position.chainId}</span>
            </div>

            <div style={{ marginTop: 8 }}>
                <div>
                    <strong>Net (USD):</strong> {position.netValueUsd ?? "-"}
                </div>
                <div>
                    <strong>Health Factor:</strong> {position.health?.healthFactor ?? "-"}
                </div>
            </div>

            <div style={{ marginTop: 10 }}>
                <strong>Supplied</strong>
                <ul>
                    {(position.supplied ?? []).map((a) => (
                        <li key={`${a.token.address}-${a.token.symbol}`}>
                            {a.token.symbol}: {a.raw.toString()} (raw)
                        </li>
                    ))}
                </ul>
            </div>

            <div style={{ marginTop: 10 }}>
                <strong>Borrowed</strong>
                <ul>
                    {(position.borrowed ?? []).map((a) => (
                        <li key={`${a.token.address}-${a.token.symbol}`}>
                            {a.token.symbol}: {a.raw.toString()} (raw)
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
