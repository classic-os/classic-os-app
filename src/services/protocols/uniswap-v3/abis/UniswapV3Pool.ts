// src/services/protocols/uniswap-v3/abis/UniswapV3Pool.ts
import type { Abi } from "viem";

export const UNISWAP_V3_POOL_ABI = [
    {
        type: "function",
        name: "slot0",
        stateMutability: "view",
        inputs: [],
        outputs: [
            { name: "sqrtPriceX96", type: "uint160" },
            { name: "tick", type: "int24" },
            { name: "observationIndex", type: "uint16" },
            { name: "observationCardinality", type: "uint16" },
            { name: "observationCardinalityNext", type: "uint16" },
            { name: "feeProtocol", type: "uint8" },
            { name: "unlocked", type: "bool" },
        ],
    },
    {
        type: "function",
        name: "liquidity",
        stateMutability: "view",
        inputs: [],
        outputs: [{ name: "", type: "uint128" }],
    },
    {
        type: "function",
        name: "token0",
        stateMutability: "view",
        inputs: [],
        outputs: [{ name: "", type: "address" }],
    },
    {
        type: "function",
        name: "token1",
        stateMutability: "view",
        inputs: [],
        outputs: [{ name: "", type: "address" }],
    },
] as const satisfies Abi;
