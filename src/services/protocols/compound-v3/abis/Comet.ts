// src/services/protocols/compound-v3/abis/Comet.ts
import type { Abi } from "viem";

export const COMET_ABI = [
    {
        type: "function",
        name: "baseToken",
        stateMutability: "view",
        inputs: [],
        outputs: [{ name: "", type: "address" }],
    },
    {
        type: "function",
        name: "numAssets",
        stateMutability: "view",
        inputs: [],
        outputs: [{ name: "", type: "uint8" }],
    },
    {
        type: "function",
        name: "getAssetInfo",
        stateMutability: "view",
        inputs: [{ name: "i", type: "uint8" }],
        outputs: [
            {
                type: "tuple",
                components: [
                    { name: "offset", type: "uint8" },
                    { name: "asset", type: "address" },
                    { name: "priceFeed", type: "address" },
                    { name: "scale", type: "uint64" },
                    { name: "borrowCollateralFactor", type: "uint64" },
                    { name: "liquidateCollateralFactor", type: "uint64" },
                    { name: "liquidationFactor", type: "uint64" },
                    { name: "supplyCap", type: "uint128" },
                ],
            },
        ],
    },
    {
        type: "function",
        name: "collateralBalanceOf",
        stateMutability: "view",
        inputs: [
            { name: "account", type: "address" },
            { name: "asset", type: "address" },
        ],
        outputs: [{ name: "", type: "uint128" }],
    },
    {
        type: "function",
        name: "borrowBalanceOf",
        stateMutability: "view",
        inputs: [{ name: "account", type: "address" }],
        outputs: [{ name: "", type: "uint256" }],
    },
    {
        type: "function",
        name: "isLiquidatable",
        stateMutability: "view",
        inputs: [{ name: "account", type: "address" }],
        outputs: [{ name: "", type: "bool" }],
    },
] as const satisfies Abi;
