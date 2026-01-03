// src/services/protocols/aave-v3/aaveV3.ethereum.mock.ts
import type { Address, ProtocolPosition } from "@/types/domain";
import type { ProtocolService } from "../types";

const PROTOCOL_ID = "aave-v3-eth" as const;
const PROTOCOL_NAME = "Aave V3" as const;
const CHAIN_ID = 1 as const;

export const AaveV3EthereumMock: ProtocolService = {
    id: PROTOCOL_ID,
    name: PROTOCOL_NAME,
    chainId: CHAIN_ID,
    protocolType: "lending",

    // Actions not implemented yet; keep capability flags honest.
    supports: { supply: false, withdraw: false, borrow: false, repay: false },

    async getUserPositions(_address: Address): Promise<ProtocolPosition[]> {
        return [
            {
                protocolId: this.id,
                chainId: this.chainId,
                label: this.name,
                supplied: [
                    {
                        token: {
                            chainId: CHAIN_ID,
                            address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC
                            symbol: "USDC",
                            name: "USD Coin",
                            decimals: 6,
                        },
                        raw: 5000000000n, // 5,000 USDC
                    },
                ],
                borrowed: [
                    {
                        token: {
                            chainId: CHAIN_ID,
                            address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // WETH
                            symbol: "WETH",
                            name: "Wrapped Ether",
                            decimals: 18,
                        },
                        raw: 200000000000000000n, // 0.2 WETH
                    },
                ],
                netValueUsd: 4500, // mock display value
                health: { healthFactor: 1.75 },
                updatedAt: Date.now(),
            },
        ];
    },
};
