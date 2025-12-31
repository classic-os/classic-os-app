import type { ProtocolPosition } from "@/types/domain";
import { USDC, WETH } from "./tokens";

export const mockPositions: ProtocolPosition[] = [
    {
        protocolId: "aave-v3-eth",
        chainId: 1,
        label: "Aave V3",
        supplied: [{ token: WETH, raw: 2_000000000000000000n }],
        borrowed: [{ token: USDC, raw: 1200_000000n }],
        netValueUsd: 2400,
        health: { healthFactor: 1.72, liquidationThreshold: 0.83, ltv: 0.78 },
        updatedAt: Date.now(),
    },
];
