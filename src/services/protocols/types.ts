import type { Address, ChainId, ProtocolPosition, ProtocolType, Token, TxPlan } from "@/types/domain";

export type ProtocolService = {
    // stable internal id, e.g. "aave-v3-eth"
    id: string;

    // display name, e.g. "Aave V3"
    name: string;

    // each service is chain-specific
    chainId: ChainId;

    protocolType: ProtocolType;

    // reads
    getUserPositions(address: Address): Promise<ProtocolPosition[]>;

    // write intent: returns a plan (no sending/signing here)
    supply?: (token: Token, amount: bigint) => Promise<TxPlan>;
    withdraw?: (token: Token, amount: bigint) => Promise<TxPlan>;
    borrow?: (token: Token, amount: bigint) => Promise<TxPlan>;
    repay?: (token: Token, amount: bigint) => Promise<TxPlan>;

    // capability introspection for UI gating
    supports: {
        supply: boolean;
        withdraw: boolean;
        borrow: boolean;
        repay: boolean;
    };
};

export type ChainProtocolRegistry = Record<ChainId, Record<string, ProtocolService>>;
