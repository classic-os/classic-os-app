// src/services/protocols/aave-v3/aaveV3.sepolia.live.ts
import type { Address, ProtocolPosition, TxPlan } from "@/types/domain";
import type { ProtocolService } from "../types";
import { createPublicClient, http, type Abi } from "viem";
import { sepolia } from "viem/chains";

// NOTE: This is the Sepolia Aave V3 Pool Proxy used for getUserAccountData.
// Reserve-level breakdown can be added later once we wire the testnet data provider.
const PROTOCOL_ID = "aave-v3-sepolia" as const;
const PROTOCOL_NAME = "Aave V3" as const;
const CHAIN_ID = 11155111 as const;

const AAVE_V3_POOL_SEPOLIA = "0xE7EC1B0015eb2ADEedb1B7f9F1Ce82F9DAD6dF08" as const;

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

const publicClient = createPublicClient({
    chain: sepolia,
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

export const AaveV3SepoliaLive: ProtocolService = {
    id: PROTOCOL_ID,
    name: PROTOCOL_NAME,
    chainId: CHAIN_ID,
    protocolType: "lending",

    supports: { supply: false, withdraw: false, borrow: false, repay: false },

    async getUserPositions(address: Address): Promise<ProtocolPosition[]> {
        const accountResult = await publicClient.readContract({
            address: AAVE_V3_POOL_SEPOLIA,
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

        // On Aave V3, base is in 1e8 "USD base" units and HF is in 1e18.
        const USD_BASE = 100000000n; // 1e8
        const HF_WAD = 1000000000000000000n; // 1e18

        const netBase = totalCollateralBase - totalDebtBase;
        const netValueUsd = toNumberSafe(netBase, USD_BASE);
        const healthFactor = toNumberSafe(healthFactorRaw, HF_WAD);

        const hasAnyPosition = !(totalCollateralBase === 0n && totalDebtBase === 0n);

        // For now: reserve-level supplied/borrowed on Sepolia is intentionally omitted.
        // This still makes Sepolia “functional” for testing wallet+chain plumbing and account health reads.
        return [
            {
                protocolId: this.id,
                chainId: this.chainId,
                label: `${this.name} (Sepolia)`,
                supplied: [],
                borrowed: [],
                netValueUsd: Number.isFinite(netValueUsd) ? netValueUsd : undefined,
                health: {
                    healthFactor: hasAnyPosition && Number.isFinite(healthFactor) ? healthFactor : undefined,
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
