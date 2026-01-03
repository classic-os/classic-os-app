// src/services/protocols/uniswap-v2/uniswapV2.ethereum.live.ts
import type { Address, Amount, ProtocolPosition, Token } from "@/types/domain";
import type { ProtocolService } from "../types";
import { createPublicClient, http } from "viem";
import { mainnet } from "viem/chains";
import { PAIR_ABI } from "./abis/Pair";
import { ERC20_ABI } from "./abis/ERC20";

const PROTOCOL_ID = "uniswap-v2-eth" as const;
const PROTOCOL_NAME = "Uniswap V2" as const;
const CHAIN_ID = 1 as const;

// Curated allowlist of top Uniswap V2 pairs on Ethereum mainnet
const UNISWAP_V2_PAIR_ALLOWLIST: Address[] = [
    "0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc", // WETH/USDC
    "0x0d4a11d5EEaaC28EC3F61d100daF4d40471f1852", // WETH/USDT
    "0xA478c2975Ab1Ea89e8196811F51A7B7Ade33eB11", // WETH/DAI
    "0xBb2b8038a1640196FbE3e38816F3e67Cba72D940", // WETH/WBTC
    "0xd3d2e2692501a5c9ca623199d38826e513033a17", // WETH/UNI
    "0xa2107FA5B38d9bbd2C461D6EdF11B11A50F6b974", // WETH/LINK
    "0xdfc14d2af169b0d36c4eff567ada9b2e0cae044f", // WETH/AAVE
    "0x3dA1313aE46132A397D90d95B1424A9A7e3e0fCE", // WETH/CRV
    "0xc2adda861f89bbb333c90c492cb837741916a225", // WETH/MKR
];

const publicClient = createPublicClient({
    chain: mainnet,
    transport: http(),
});

// In-memory token metadata cache
const tokenMetadataCache = new Map<string, Token>();

function getCacheKey(chainId: number, address: Address): string {
    return `${chainId}-${address.toLowerCase()}`;
}

async function fetchTokenMetadata(chainId: number, address: Address): Promise<Token | null> {
    const cacheKey = getCacheKey(chainId, address);
    const cached = tokenMetadataCache.get(cacheKey);
    if (cached) return cached;

    try {
        const [decimals, symbol, name] = await Promise.all([
            publicClient.readContract({
                address,
                abi: ERC20_ABI,
                functionName: "decimals",
            }),
            publicClient.readContract({
                address,
                abi: ERC20_ABI,
                functionName: "symbol",
            }),
            publicClient.readContract({
                address,
                abi: ERC20_ABI,
                functionName: "name",
            }),
        ]);

        const token: Token = {
            chainId,
            address,
            decimals: decimals as number,
            symbol: symbol as string,
            name: name as string,
        };

        tokenMetadataCache.set(cacheKey, token);
        return token;
    } catch (error) {
        console.warn(`Failed to fetch token metadata for ${address}:`, error);
        return null;
    }
}

export const UniswapV2EthereumLive: ProtocolService = {
    id: PROTOCOL_ID,
    name: PROTOCOL_NAME,
    chainId: CHAIN_ID,
    protocolType: "dex",

    // Read-only only (actions intentionally omitted until implemented)
    supports: {},

    async getUserPositions(address: Address): Promise<ProtocolPosition[]> {
        const positions: ProtocolPosition[] = [];

        for (const pairAddress of UNISWAP_V2_PAIR_ALLOWLIST) {
            try {
                const lpBalance = (await publicClient.readContract({
                    address: pairAddress,
                    abi: PAIR_ABI,
                    functionName: "balanceOf",
                    args: [address],
                })) as bigint;

                if (lpBalance === 0n) continue;

                const [token0Address, token1Address, reserves, totalSupply] = await Promise.all([
                    publicClient.readContract({
                        address: pairAddress,
                        abi: PAIR_ABI,
                        functionName: "token0",
                    }),
                    publicClient.readContract({
                        address: pairAddress,
                        abi: PAIR_ABI,
                        functionName: "token1",
                    }),
                    publicClient.readContract({
                        address: pairAddress,
                        abi: PAIR_ABI,
                        functionName: "getReserves",
                    }),
                    publicClient.readContract({
                        address: pairAddress,
                        abi: PAIR_ABI,
                        functionName: "totalSupply",
                    }),
                ]);

                // Avoid brittle tuple casting (TS/viem may type uint32 as number in some setups).
                const r = reserves as unknown as readonly [unknown, unknown, unknown];
                const reserve0 = r[0] as bigint;
                const reserve1 = r[1] as bigint;

                const totalSupplyBigInt = totalSupply as bigint;
                if (totalSupplyBigInt === 0n) continue;

                const amount0 = (reserve0 * lpBalance) / totalSupplyBigInt;
                const amount1 = (reserve1 * lpBalance) / totalSupplyBigInt;

                if (amount0 === 0n && amount1 === 0n) continue;

                const [token0Meta, token1Meta] = await Promise.all([
                    fetchTokenMetadata(CHAIN_ID, token0Address as Address),
                    fetchTokenMetadata(CHAIN_ID, token1Address as Address),
                ]);

                if (!token0Meta || !token1Meta) {
                    console.warn(`Skipping pair ${pairAddress}: failed to fetch token metadata`);
                    continue;
                }

                const supplied: Amount[] = [];
                if (amount0 > 0n) supplied.push({ token: token0Meta, raw: amount0 });
                if (amount1 > 0n) supplied.push({ token: token1Meta, raw: amount1 });
                if (supplied.length === 0) continue;

                positions.push({
                    protocolId: this.id,
                    chainId: this.chainId,
                    label: "Uniswap V2 LP",
                    supplied,
                    updatedAt: Date.now(),
                });
            } catch (error) {
                console.warn(`Failed to process pair ${pairAddress}:`, error);
            }
        }

        return positions;
    },
};
