import type { Address, Amount, ProtocolPosition, Token, TxPlan } from "@/types/domain";
import type { ProtocolService } from "../types";
import { createPublicClient, http, type Abi } from "viem";
import { mainnet } from "viem/chains";

const AAVE_V3_POOL_ETHEREUM = "0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2" as const;
const AAVE_PROTOCOL_DATA_PROVIDER = "0x497a1994c46d4f6C864904A9f1fac6328Cb7C8a6" as const;

const AAVE_POOL_ABI = [
    {
        type: "function",
        name: "getUserAccountData",
        stateMutability: "view",
        inputs: [{ name: "user", type: "address" }],
        outputs: [
            { name: "totalCollateralBase", type: "uint256" },
            { name: "totalDebtBase", type: "uint256" },
            { name: "availableBorrowsBase", type: "uint256" },
            { name: "currentLiquidationThreshold", type: "uint256" },
            { name: "ltv", type: "uint256" },
            { name: "healthFactor", type: "uint256" },
        ],
    },
] as const satisfies Abi;

const AAVE_PROTOCOL_DATA_PROVIDER_ABI = [
    {
        type: "function",
        name: "getAllReservesTokens",
        stateMutability: "view",
        inputs: [],
        outputs: [
            {
                type: "tuple[]",
                components: [
                    { name: "symbol", type: "string" },
                    { name: "tokenAddress", type: "address" },
                ],
            },
        ],
    },
    {
        type: "function",
        name: "getUserReserveData",
        stateMutability: "view",
        inputs: [
            { name: "asset", type: "address" },
            { name: "user", type: "address" },
        ],
        outputs: [
            { name: "currentATokenBalance", type: "uint256" }, // idx 0
            { name: "currentStableDebt", type: "uint256" }, // idx 1
            { name: "currentVariableDebt", type: "uint256" }, // idx 2
            { name: "principalStableDebt", type: "uint256" },
            { name: "scaledVariableDebt", type: "uint256" },
            { name: "stableBorrowRate", type: "uint256" },
            { name: "liquidityRate", type: "uint256" },
            { name: "stableRateLastUpdated", type: "uint40" },
            { name: "usageAsCollateralEnabled", type: "bool" },
        ],
    },
] as const satisfies Abi;

const ERC20_ABI = [
    {
        type: "function",
        name: "decimals",
        stateMutability: "view",
        inputs: [],
        outputs: [{ name: "", type: "uint8" }],
    },
    {
        type: "function",
        name: "symbol",
        stateMutability: "view",
        inputs: [],
        outputs: [{ name: "", type: "string" }],
    },
    {
        type: "function",
        name: "name",
        stateMutability: "view",
        inputs: [],
        outputs: [{ name: "", type: "string" }],
    },
] as const satisfies Abi;

const publicClient = createPublicClient({
    chain: mainnet,
    transport: http(),
});

function toNumberSafe(n: bigint, denom: bigint): number {
    const sign = n < 0n ? -1 : 1;
    const abs = n < 0n ? -n : n;
    const whole = abs / denom;
    const frac = abs % denom;

    if (whole > BigInt(Number.MAX_SAFE_INTEGER)) return sign * Number.POSITIVE_INFINITY;

    const wholeNum = Number(whole);
    const fracNum = Number(frac) / Number(denom);
    return sign * (wholeNum + fracNum);
}

function toNumberU8(x: unknown, fallback = 18): number {
    if (typeof x === "number" && Number.isFinite(x)) return x;
    if (typeof x === "bigint") return x <= 255n ? Number(x) : fallback;
    return fallback;
}

export const AaveV3EthereumLive: ProtocolService = {
    id: "aave-v3-eth",
    name: "Aave V3",
    chainId: 1,
    protocolType: "lending",
    supports: { supply: true, withdraw: true, borrow: true, repay: true },

    async getUserPositions(address: Address): Promise<ProtocolPosition[]> {
        // Phase 3: Fetch user account data (net value + health factor)
        const accountResult = await publicClient.readContract({
            address: AAVE_V3_POOL_ETHEREUM,
            abi: AAVE_POOL_ABI,
            functionName: "getUserAccountData",
            args: [address],
        });

        const [
            totalCollateralBase,
            totalDebtBase,
            _availableBorrowsBase,
            currentLiquidationThreshold,
            ltv,
            healthFactorRaw,
        ] = accountResult as readonly [bigint, bigint, bigint, bigint, bigint, bigint];

        const USD_BASE = 100000000n; // 1e8
        const HF_WAD = 1000000000000000000n; // 1e18

        const netBase = totalCollateralBase - totalDebtBase;
        const netValueUsd = toNumberSafe(netBase, USD_BASE);
        const healthFactor = toNumberSafe(healthFactorRaw, HF_WAD);

        const hasAccountPosition = !(totalCollateralBase === 0n && totalDebtBase === 0n);

        // Phase 4: Fetch reserve-level positions
        const supplied: Amount[] = [];
        const borrowed: Amount[] = [];

        try {
            // Get all reserve token addresses
            const reservesResult = await publicClient.readContract({
                address: AAVE_PROTOCOL_DATA_PROVIDER,
                abi: AAVE_PROTOCOL_DATA_PROVIDER_ABI,
                functionName: "getAllReservesTokens",
                args: [],
            });

            const reserves = (reservesResult as readonly unknown[]).map((r) => {
                // viem may decode tuples either as [symbol, tokenAddress] or as { symbol, tokenAddress }
                if (Array.isArray(r)) return r[1] as Address;
                return (r as { tokenAddress: Address }).tokenAddress;
            });

            if (reserves.length === 0) {
                const hasAnyPosition = hasAccountPosition;
                return [
                    {
                        protocolId: this.id,
                        chainId: this.chainId,
                        label: hasAnyPosition ? `${this.name} (live)` : `${this.name} (live, empty)`,
                        supplied,
                        borrowed,
                        netValueUsd: Number.isFinite(netValueUsd) ? netValueUsd : undefined,
                        health: {
                            healthFactor:
                                hasAnyPosition && Number.isFinite(healthFactor)
                                    ? healthFactor
                                    : undefined,
                            liquidationThreshold:
                                currentLiquidationThreshold > BigInt(Number.MAX_SAFE_INTEGER)
                                    ? undefined
                                    : Number(currentLiquidationThreshold),
                            ltv: ltv > BigInt(Number.MAX_SAFE_INTEGER) ? undefined : Number(ltv),
                        },
                        updatedAt: Date.now(),
                    },
                ];
            }

            // Batch fetch user reserve data for all reserves
            const reserveDataCalls = reserves.map((reserveAddr) => ({
                address: AAVE_PROTOCOL_DATA_PROVIDER,
                abi: AAVE_PROTOCOL_DATA_PROVIDER_ABI,
                functionName: "getUserReserveData" as const,
                args: [reserveAddr, address] as const,
            }));

            const reserveDataResults = await publicClient.multicall({
                contracts: reserveDataCalls,
                allowFailure: true,
            });

            // Identify assets with non-zero supply or borrow
            const assetsToFetchMetadata: Address[] = [];
            const seen = new Set<Address>();

            const reserveDataMap = new Map<
                Address,
                {
                    currentATokenBalance: bigint;
                    currentStableDebt: bigint;
                    currentVariableDebt: bigint;
                }
            >();

            reserves.forEach((reserveAddr, idx) => {
                const r = reserveDataResults[idx];
                if (r?.status !== "success") return;

                const data = r.result as unknown as readonly [
                    bigint,
                    bigint,
                    bigint,
                    bigint,
                    bigint,
                    bigint,
                    bigint,
                    bigint | number,
                    boolean,
                ];

                const [currentATokenBalance, currentStableDebt, currentVariableDebt] = data;

                const totalBorrow = currentStableDebt + currentVariableDebt;
                if (currentATokenBalance > 0n || totalBorrow > 0n) {
                    reserveDataMap.set(reserveAddr, {
                        currentATokenBalance,
                        currentStableDebt,
                        currentVariableDebt,
                    });

                    if (!seen.has(reserveAddr)) {
                        seen.add(reserveAddr);
                        assetsToFetchMetadata.push(reserveAddr);
                    }
                }
            });

            // Batch fetch ERC20 metadata for assets with positions
            const metadataMap = new Map<Address, { decimals: number; symbol: string; name: string }>();

            if (assetsToFetchMetadata.length > 0) {
                const assets = assetsToFetchMetadata;

                const metadataCalls = assets.flatMap((assetAddr) => [
                    {
                        address: assetAddr,
                        abi: ERC20_ABI,
                        functionName: "decimals" as const,
                        args: [] as const,
                    },
                    {
                        address: assetAddr,
                        abi: ERC20_ABI,
                        functionName: "symbol" as const,
                        args: [] as const,
                    },
                    {
                        address: assetAddr,
                        abi: ERC20_ABI,
                        functionName: "name" as const,
                        args: [] as const,
                    },
                ]);

                const metadataResults = await publicClient.multicall({
                    contracts: metadataCalls,
                    allowFailure: true,
                });

                for (let i = 0; i < assets.length; i++) {
                    const assetAddr = assets[i];
                    const decimalsResult = metadataResults[i * 3 + 0];
                    const symbolResult = metadataResults[i * 3 + 1];
                    const nameResult = metadataResults[i * 3 + 2];

                    const decimals =
                        decimalsResult?.status === "success"
                            ? toNumberU8(decimalsResult.result, 18)
                            : 18;
                    const symbol =
                        symbolResult?.status === "success"
                            ? String(symbolResult.result)
                            : "UNKNOWN";
                    const name =
                        nameResult?.status === "success"
                            ? String(nameResult.result)
                            : "Unknown Token";

                    metadataMap.set(assetAddr, { decimals, symbol, name });
                }
            }

            // Map reserve data to supplied and borrowed amounts
            reserveDataMap.forEach((data, assetAddr) => {
                const metadata = metadataMap.get(assetAddr) || {
                    decimals: 18,
                    symbol: "UNKNOWN",
                    name: "Unknown Token",
                };

                const token: Token = {
                    chainId: 1,
                    address: assetAddr,
                    decimals: metadata.decimals,
                    symbol: metadata.symbol,
                    name: metadata.name,
                };

                // Supply
                if (data.currentATokenBalance > 0n) {
                    supplied.push({
                        token,
                        raw: data.currentATokenBalance,
                    });
                }

                // Borrow (combine stable + variable into single entry)
                const totalBorrow = data.currentStableDebt + data.currentVariableDebt;
                if (totalBorrow > 0n) {
                    borrowed.push({
                        token,
                        raw: totalBorrow,
                    });
                }
            });
        } catch (error) {
            // If reserve-level fetch fails, fall back to empty supplied/borrowed
            console.warn(
                "Phase 4: Failed to fetch reserve-level positions, falling back to empty",
                error
            );
        }

        const hasReservePosition = supplied.length > 0 || borrowed.length > 0;
        const hasAnyPosition = hasAccountPosition || hasReservePosition;

        return [
            {
                protocolId: this.id,
                chainId: this.chainId,
                label: hasAnyPosition ? `${this.name} (live)` : `${this.name} (live, empty)`,
                supplied,
                borrowed,
                netValueUsd: Number.isFinite(netValueUsd) ? netValueUsd : undefined,
                health: {
                    healthFactor:
                        hasAnyPosition && Number.isFinite(healthFactor) ? healthFactor : undefined,
                    liquidationThreshold:
                        currentLiquidationThreshold > BigInt(Number.MAX_SAFE_INTEGER)
                            ? undefined
                            : Number(currentLiquidationThreshold),
                    ltv: ltv > BigInt(Number.MAX_SAFE_INTEGER) ? undefined : Number(ltv),
                },
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
