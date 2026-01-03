// src/services/protocols/uniswap-v2/uniswapV2.ethereum.mock.ts
import type { Address, ProtocolPosition } from "@/types/domain";
import type { ProtocolService } from "../types";

const PROTOCOL_ID = "uniswap-v2-eth" as const;
const PROTOCOL_NAME = "Uniswap V2" as const;
const CHAIN_ID = 1 as const;

export const UniswapV2EthereumMock: ProtocolService = {
    id: PROTOCOL_ID,
    name: PROTOCOL_NAME,
    chainId: CHAIN_ID,
    protocolType: "dex",

    supports: {},

    async getUserPositions(_address: Address): Promise<ProtocolPosition[]> {
        return [
            {
                protocolId: this.id,
                chainId: this.chainId,
                label: "Uniswap V2 LP",
                supplied: [
                    {
                        token: {
                            chainId: CHAIN_ID,
                            address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
                            symbol: "WETH",
                            name: "Wrapped Ether",
                            decimals: 18,
                        },
                        raw: 1000000000000000000n, // 1 WETH
                    },
                    {
                        token: {
                            chainId: CHAIN_ID,
                            address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
                            symbol: "USDC",
                            name: "USD Coin",
                            decimals: 6,
                        },
                        raw: 2000000000n, // 2000 USDC
                    },
                ],
                updatedAt: Date.now(),
            },
            {
                protocolId: this.id,
                chainId: this.chainId,
                label: "Uniswap V2 LP",
                supplied: [
                    {
                        token: {
                            chainId: CHAIN_ID,
                            address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
                            symbol: "WETH",
                            name: "Wrapped Ether",
                            decimals: 18,
                        },
                        raw: 500000000000000000n, // 0.5 WETH
                    },
                    {
                        token: {
                            chainId: CHAIN_ID,
                            address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
                            symbol: "DAI",
                            name: "Dai Stablecoin",
                            decimals: 18,
                        },
                        raw: 1000000000000000000000n, // 1000 DAI
                    },
                ],
                updatedAt: Date.now(),
            },
        ];
    },
};
