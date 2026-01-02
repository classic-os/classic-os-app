// src/services/protocols/aave-v3/aaveV3.sepolia.mock.ts
import type { Address, ProtocolPosition, TxPlan } from "@/types/domain";
import type { ProtocolService } from "../types";

const PROTOCOL_ID = "aave-v3-sepolia-mock" as const;
const PROTOCOL_NAME = "Aave V3" as const;
const CHAIN_ID = 11155111 as const;

export const AaveV3SepoliaMock: ProtocolService = {
    id: PROTOCOL_ID,
    name: PROTOCOL_NAME,
    chainId: CHAIN_ID,
    protocolType: "lending",

    supports: { supply: false, withdraw: false, borrow: false, repay: false },

    async getUserPositions(_address: Address): Promise<ProtocolPosition[]> {
        return [
            {
                protocolId: this.id,
                chainId: this.chainId,
                label: `${this.name} (Sepolia)`,
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
