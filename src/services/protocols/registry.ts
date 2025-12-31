import type { ChainProtocolRegistry } from "./types";
import { AaveV3EthereumMock } from "./mock/AaveV3Ethereum.mock";

export const protocolRegistry: ChainProtocolRegistry = {
    1: {
        [AaveV3EthereumMock.id]: AaveV3EthereumMock,
    },

    // Sepolia (testnet): reuse Ethereum mocks for now so the UI can exercise testnet filtering.
    11155111: {
        [AaveV3EthereumMock.id]: AaveV3EthereumMock,
    },
};
