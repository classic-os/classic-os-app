import { useAccount, useConnect, useDisconnect } from "wagmi";

function shortAddr(addr: string) {
    return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export default function ConnectButton() {
    const { address, isConnected } = useAccount();
    const { connectors, connect, isPending, error } = useConnect();
    const { disconnect } = useDisconnect();

    if (isConnected && address) {
        return (
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ color: "#555" }}>{shortAddr(address)}</span>
                <button onClick={() => disconnect()}>Disconnect</button>
            </div>
        );
    }

    // Minimal: pick first connector (usually injected)
    const connector = connectors[0];

    return (
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button disabled={!connector || isPending} onClick={() => connector && connect({ connector })}>
                {isPending ? "Connecting…" : "Connect Wallet"}
            </button>
            {error ? <span style={{ color: "crimson" }}>{error.message}</span> : null}
        </div>
    );
}
