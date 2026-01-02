// src/services/protocols/aave-v3/aaveV3.ethereum.mock.ts
import type { Address, ProtocolPosition, TxPlan } from "@/types/domain";
import type { ProtocolService } from "../types";

const PROTOCOL_ID = "aave-v3-eth-mock" as const;
const PROTOCOL_NAME = "Aave V3" as const;
const CHAIN_ID = 1 as const;

export const AaveV3EthereumMock: ProtocolService = {
    id: PROTOCOL_ID,
    name: PROTOCOL_NAME,
    chainId: CHAIN_ID,
    protocolType: "lending",

    // Keep capability flags honest in mock as well.
    supports: { supply: false, withdraw: false, borrow: false, repay: false },

    async getUserPositions(_address: Address): Promise<ProtocolPosition[]> {
        return [
            {
                protocolId: this.id,
                chainId: this.chainId,
                label: this.name,
                supplied: [],
                borrowed: [],
                updatedAt: Date.now(),
            },
        ];
    },

    async supply(): Promise<TxPlan> {
        return { kind: "single", steps: [] };
    },
    async withdraw(): Promise<TxPlan> {
        return { kind: "single", steps: [] };
    },
    async borrow(): Promise<TxPlan> {
        return { kind: "single", steps: [] };
    },
    async repay(): Promise<TxPlan> {
        return { kind: "single", steps: [] };
    },
};
