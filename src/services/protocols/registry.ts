// src/services/protocols/registry.ts
import type { ChainProtocolRegistry } from "./types";
import { FEATURE_LIVE_READS } from "@/config/featureFlags";
import { selectByFlag } from "./select";

import {
    AaveV3EthereumLive,
    AaveV3EthereumMock,
    AaveV3SepoliaLive,
    AaveV3SepoliaMock,
} from "./aave-v3";

// Ethereum mainnet selection (live vs mock behind a single flag)
const aaveV3Ethereum = selectByFlag(FEATURE_LIVE_READS, AaveV3EthereumLive, AaveV3EthereumMock);

// Sepolia selection (also behind the same flag so testnet can be “real” when live reads are on)
const aaveV3Sepolia = selectByFlag(FEATURE_LIVE_READS, AaveV3SepoliaLive, AaveV3SepoliaMock);

export const protocolRegistry: ChainProtocolRegistry = {
    // Ethereum mainnet
    1: {
        [aaveV3Ethereum.id]: aaveV3Ethereum,
    },

    // Sepolia (first functional testnet)
    11155111: {
        [aaveV3Sepolia.id]: aaveV3Sepolia,
    },
};
