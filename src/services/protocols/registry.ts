import type { ChainProtocolRegistry } from "./types";
import { AaveV3EthereumMock } from "./mock/AaveV3Ethereum.mock";

export const protocolRegistry: ChainProtocolRegistry = {
    1: {
        [AaveV3EthereumMock.id]: AaveV3EthereumMock,
    },
};
