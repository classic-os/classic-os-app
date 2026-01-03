// src/services/protocols/aave-v3/aaveV3.sepolia.mock.ts
import type { Address, ProtocolPosition } from "@/types/domain";
import type { ProtocolService } from "../types";

const PROTOCOL_ID = "aave-v3-sepolia" as const;
const PROTOCOL_NAME = "Aave V3" as const;
const CHAIN_ID = 11155111 as const;

export const AaveV3SepoliaMock: ProtocolService = {
    id: PROTOCOL_ID,
    name: PROTOCOL_NAME,
    chainId: CHAIN_ID,
    protocolType: "lending",

    // Actions are not implemented yet; keep capability flags honest.
    supports: { supply: false, withdraw: false, borrow: false, repay: false },

    async getUserPositions(_address: Address): Promise<ProtocolPosition[]> {
        // Mock returns no positions by default.
        return [];
    },
};
