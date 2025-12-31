import type { ProtocolPosition } from "@/types/domain";
import { formatTokenAmount, formatUsd } from "@/utils/format";

function parseUsd(value: unknown): number | null {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string") {
        const n = Number(value);
        return Number.isFinite(n) ? n : null;
    }
    return null;
}

function formatHealthFactor(value: unknown): string {
    if (value == null) return "-";
    if (typeof value === "number" && Number.isFinite(value)) {
        return value.toFixed(2);
    }
    // Some protocols represent HF as string or bigint-ish; just print it.
    return String(value);
}

export default function PositionCard({ position }: { position: ProtocolPosition }) {
    const netUsd = parseUsd(position.netValueUsd);

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
                    <strong>Net (USD):</strong> {netUsd == null ? "-" : formatUsd(netUsd)}
                </div>
                <div>
                    <strong>Health Factor:</strong> {formatHealthFactor(position.health?.healthFactor)}
                </div>
            </div>

            <div style={{ marginTop: 10 }}>
                <strong>Supplied</strong>
                {(position.supplied ?? []).length === 0 ? (
                    <div style={{ color: "#666", marginTop: 6 }}>None</div>
                ) : (
                    <ul style={{ marginTop: 6 }}>
                        {(position.supplied ?? []).map((a) => (
                            <li key={`${a.token.address}-${a.token.symbol}`}>
                                {a.token.symbol}: {formatTokenAmount(a.raw, a.token.decimals)}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div style={{ marginTop: 10 }}>
                <strong>Borrowed</strong>
                {(position.borrowed ?? []).length === 0 ? (
                    <div style={{ color: "#666", marginTop: 6 }}>None</div>
                ) : (
                    <ul style={{ marginTop: 6 }}>
                        {(position.borrowed ?? []).map((a) => (
                            <li key={`${a.token.address}-${a.token.symbol}`}>
                                {a.token.symbol}: {formatTokenAmount(a.raw, a.token.decimals)}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
