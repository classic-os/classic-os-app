// src/services/protocols/types.ts
import type { Address, ProtocolPosition, TxPlan } from "@/types/domain";

export type ProtocolType = "lending" | "dex" | "launchpad" | "fiat" | "unknown";

export type ProtocolSupports = {
    supply?: boolean;
    withdraw?: boolean;
    borrow?: boolean;
    repay?: boolean;
    swap?: boolean;
    addLiquidity?: boolean;
    removeLiquidity?: boolean;
};

export type ProtocolService = {
    /** Stable internal identifier (do not change once released) */
    id: string;

    /** Human readable name (UI display) */
    name: string;

    /** EVM chain id this service is scoped to */
    chainId: number;

    /** Rough category used for grouping / routing */
    protocolType: ProtocolType;

    /** Capability hints; keep honest (false until actions exist) */
    supports?: ProtocolSupports;

    /** Read-only: return normalized positions for this user */
    getUserPositions(address: Address): Promise<ProtocolPosition[]>;

    /** Optional action builders (TxPlan). Keep stubs allowed for now. */
    supply?: (...args: any[]) => Promise<TxPlan>;
    withdraw?: (...args: any[]) => Promise<TxPlan>;
    borrow?: (...args: any[]) => Promise<TxPlan>;
    repay?: (...args: any[]) => Promise<TxPlan>;
};

export type ChainProtocolMap = Record<string, ProtocolService>;
export type ChainProtocolRegistry = Record<number, ChainProtocolMap>;
