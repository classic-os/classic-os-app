import type { ChainProtocolRegistry } from "./types";
import { AaveV3EthereumMock } from "./mock/AaveV3Ethereum.mock";
import { AaveV3EthereumLive } from "./live/AaveV3Ethereum.live";
import { FEATURE_LIVE_READS } from "@/config/featureFlags";

export const protocolRegistry: ChainProtocolRegistry = {
    1: {
        // Phase 3: swap mock → live behind a single flag, Ethereum mainnet only.
        [(FEATURE_LIVE_READS ? AaveV3EthereumLive : AaveV3EthereumMock).id]: FEATURE_LIVE_READS
            ? AaveV3EthereumLive
            : AaveV3EthereumMock,
    },

    // Sepolia stays mocked for now.
    11155111: {
        [AaveV3EthereumMock.id]: AaveV3EthereumMock,
    },
};
