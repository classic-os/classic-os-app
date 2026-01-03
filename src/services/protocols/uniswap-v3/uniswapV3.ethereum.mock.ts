// src/services/protocols/uniswap-v3/uniswapV3.ethereum.mock.ts
import type { Address, ProtocolPosition, TxPlan } from "@/types/domain";
import type { ProtocolService } from "../types";

const PROTOCOL_ID = "uniswap-v3-eth-mock" as const;
const PROTOCOL_NAME = "Uniswap V3" as const;
const CHAIN_ID = 1 as const;

export const UniswapV3EthereumMock: ProtocolService = {
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
                label: "Uniswap V3 LP (#12345) · 0.30% · [-60000..60000]",
                supplied: [
                    {
                        token: {
                            chainId: CHAIN_ID,
                            address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
                            symbol: "WETH",
                            name: "Wrapped Ether",
                            decimals: 18,
                        },
                        raw: 0n,
                    },
                    {
                        token: {
                            chainId: CHAIN_ID,
                            address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
                            symbol: "USDC",
                            name: "USD Coin",
                            decimals: 6,
                        },
                        raw: 0n,
                    },
                ],
                updatedAt: Date.now(),
            },
            {
                protocolId: this.id,
                chainId: this.chainId,
                label: "Uniswap V3 LP (#67890) · 1.00% · [-120000..120000]",
                supplied: [
                    {
                        token: {
                            chainId: CHAIN_ID,
                            address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
                            symbol: "WETH",
                            name: "Wrapped Ether",
                            decimals: 18,
                        },
                        raw: 0n,
                    },
                    {
                        token: {
                            chainId: CHAIN_ID,
                            address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
                            symbol: "DAI",
                            name: "Dai Stablecoin",
                            decimals: 18,
                        },
                        raw: 0n,
                    },
                ],
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
