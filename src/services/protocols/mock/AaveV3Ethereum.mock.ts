import type { Address, TxPlan } from "@/types/domain";
import type { ProtocolService } from "../types";
import { mockPositions } from "@/mock/positions";

export const AaveV3EthereumMock: ProtocolService = {
    id: "aave-v3-eth",
    name: "Aave V3",
    chainId: 1,
    protocolType: "lending",
    supports: { supply: true, withdraw: true, borrow: true, repay: true },

    async getUserPositions(_address: Address) {
        return mockPositions;
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
