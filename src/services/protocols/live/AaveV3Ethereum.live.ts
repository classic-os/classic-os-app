import type { Address, ProtocolPosition, TxPlan } from "@/types/domain";
import type { ProtocolService } from "../types";
import { createPublicClient, http, type Abi } from "viem";
import { mainnet } from "viem/chains";

const AAVE_V3_POOL_ETHEREUM = "0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2" as const;

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

export const AaveV3EthereumLive: ProtocolService = {
    id: "aave-v3-eth",
    name: "Aave V3",
    chainId: 1,
    protocolType: "lending",
    supports: { supply: true, withdraw: true, borrow: true, repay: true },

    async getUserPositions(address: Address): Promise<ProtocolPosition[]> {
        const result = await publicClient.readContract({
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
        ] = result as readonly [bigint, bigint, bigint, bigint, bigint, bigint];

        const USD_BASE = 100000000n; // 1e8
        const HF_WAD = 1000000000000000000n; // 1e18

        const netBase = totalCollateralBase - totalDebtBase;
        const netValueUsd = toNumberSafe(netBase, USD_BASE);
        const healthFactor = toNumberSafe(healthFactorRaw, HF_WAD);

        const hasPosition = !(totalCollateralBase === 0n && totalDebtBase === 0n);

        return [
            {
                protocolId: this.id,
                chainId: this.chainId,
                label: hasPosition ? `${this.name} (live)` : `${this.name} (live, empty)`,
                // Phase 3: still not doing reserve-level supplied/borrowed yet.
                supplied: [],
                borrowed: [],
                netValueUsd: Number.isFinite(netValueUsd) ? netValueUsd : undefined,
                health: {
                    healthFactor: hasPosition && Number.isFinite(healthFactor) ? healthFactor : undefined,
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
