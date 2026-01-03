// src/services/protocols/compound-v3/compoundV3.ethereum.mock.ts
import type { Address, ProtocolPosition } from "@/types/domain";
import type { ProtocolService } from "../types";

const PROTOCOL_ID = "compound-v3-eth" as const;
const PROTOCOL_NAME = "Compound V3" as const;
const CHAIN_ID = 1 as const;

export const CompoundV3EthereumMock: ProtocolService = {
    id: PROTOCOL_ID,
    name: PROTOCOL_NAME,
    chainId: CHAIN_ID,
    protocolType: "lending",

    // Read-only only for now
    supports: {},

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
                            address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // WETH
                            symbol: "WETH",
                            name: "Wrapped Ether",
                            decimals: 18,
                        },
                        raw: 1000000000000000000n, // 1 WETH as collateral
                    },
                ],
                borrowed: [
                    {
                        token: {
                            chainId: CHAIN_ID,
                            address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC (base asset)
                            symbol: "USDC",
                            name: "USD Coin",
                            decimals: 6,
                        },
                        raw: 1200000000n, // 1,200 USDC borrowed
                    },
                ],
                updatedAt: Date.now(),
            },
        ];
    },
};
