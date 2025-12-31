export type Address = `0x${string}`;

export type ChainId = number;

export type Token = {
    chainId: ChainId;
    address: Address;
    symbol: string;
    name: string;
    decimals: number;
    logoURI?: string;
};

export type Amount = {
    token: Token;
    raw: bigint; // always raw units
};

export type ProtocolId = string; // e.g. "aave-v3-eth", "compound-v3-base"

export type ProtocolType = "lending" | "dex" | "yield" | "derivatives" | "other";

export type Health = {
    healthFactor?: number; // lending protocols
    liquidationThreshold?: number;
    ltv?: number;
};

export type ProtocolPosition = {
    protocolId: ProtocolId;
    chainId: ChainId;
    label: string; // human-readable display name
    supplied?: Amount[];
    borrowed?: Amount[];
    netValueUsd?: number;
    health?: Health;
    updatedAt: number; // epoch ms
};

export type TxStep = {
    chainId: ChainId;
    to: Address;
    data: `0x${string}`;
    value?: bigint;
};

export type TxPlan = {
    kind: "single" | "batch";
    steps: TxStep[];
    meta?: Record<string, unknown>;
};
