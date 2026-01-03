// src/services/protocols/uniswap-v3/uniswapV3.ethereum.live.ts
import type { Address, Amount, ProtocolPosition, Token } from "@/types/domain";
import type { ProtocolService } from "../types";
import { createPublicClient, http } from "viem";
import { mainnet } from "viem/chains";
import { NONFUNGIBLE_POSITION_MANAGER_ABI } from "./abis/NonfungiblePositionManager";
import { ERC20_ABI } from "./abis/ERC20";
import { UNISWAP_V3_FACTORY_ABI } from "./abis/UniswapV3Factory";
import { UNISWAP_V3_POOL_ABI } from "./abis/UniswapV3Pool";
import { clampTick, getAmountsForLiquidity, getSqrtRatioAtTick } from "./math";

const PROTOCOL_ID = "uniswap-v3-eth" as const;
const PROTOCOL_NAME = "Uniswap V3" as const;
const CHAIN_ID = 1 as const;

const NONFUNGIBLE_POSITION_MANAGER = "0xC36442b4a4522E871399CD717aBDD847Ab11FE88" as const;
const UNISWAP_V3_FACTORY = "0x1F98431c8aD98523631AE4a59f267346ea31F984" as const;
const MAX_POSITIONS = 50; // cap iteration to avoid abuse

const publicClient = createPublicClient({
    chain: mainnet,
    transport: http(),
});

const tokenMetadataCache = new Map<string, Token>();
const poolAddressCache = new Map<string, Address>();
const slot0Cache = new Map<Address, { sqrtPriceX96: bigint }>();

function cacheKey(chainId: number, address: Address): string {
    return `${chainId}-${address.toLowerCase()}`;
}

async function fetchTokenMetadata(chainId: number, address: Address): Promise<Token | null> {
    const key = cacheKey(chainId, address);
    const cached = tokenMetadataCache.get(key);
    if (cached) return cached;

    try {
        const [decimals, symbol, name] = await Promise.all([
            publicClient.readContract({ address, abi: ERC20_ABI, functionName: "decimals" }),
            publicClient.readContract({ address, abi: ERC20_ABI, functionName: "symbol" }),
            publicClient.readContract({ address, abi: ERC20_ABI, functionName: "name" }),
        ]);

        const token: Token = {
            chainId,
            address,
            decimals: decimals as number,
            symbol: symbol as string,
            name: name as string,
        };

        tokenMetadataCache.set(key, token);
        return token;
    } catch (error) {
        console.warn(`Uniswap V3: failed to fetch metadata for ${address}`, error);
        return null;
    }
}

function formatFeeTier(fee: number): string {
    return `${(fee / 10000).toFixed(2)}%`;
}

function poolCacheKey(token0: Address, token1: Address, fee: number): string {
    // IMPORTANT: Uniswap V3 pools are defined by canonical token0/token1 ordering.
    // The PositionManager positions() already returns canonical token0/token1.
    return `${token0.toLowerCase()}-${token1.toLowerCase()}-${fee}`;
}

export const UniswapV3EthereumLive: ProtocolService = {
    id: PROTOCOL_ID,
    name: PROTOCOL_NAME,
    chainId: CHAIN_ID,
    protocolType: "dex",

    supports: {},

    async getUserPositions(address: Address): Promise<ProtocolPosition[]> {
        try {
            const positions: ProtocolPosition[] = [];

            const balanceRaw = (await publicClient.readContract({
                address: NONFUNGIBLE_POSITION_MANAGER,
                abi: NONFUNGIBLE_POSITION_MANAGER_ABI,
                functionName: "balanceOf",
                args: [address],
            })) as bigint;

            const positionCount = balanceRaw > BigInt(MAX_POSITIONS) ? MAX_POSITIONS : Number(balanceRaw);
            if (positionCount === 0) return [];

            for (let i = 0; i < positionCount; i++) {
                try {
                    const tokenId = (await publicClient.readContract({
                        address: NONFUNGIBLE_POSITION_MANAGER,
                        abi: NONFUNGIBLE_POSITION_MANAGER_ABI,
                        functionName: "tokenOfOwnerByIndex",
                        args: [address, BigInt(i)],
                    })) as bigint;

                    const position = (await publicClient.readContract({
                        address: NONFUNGIBLE_POSITION_MANAGER,
                        abi: NONFUNGIBLE_POSITION_MANAGER_ABI,
                        functionName: "positions",
                        args: [tokenId],
                    })) as {
                        token0: Address;
                        token1: Address;
                        fee: number;
                        tickLower: number;
                        tickUpper: number;
                        liquidity: bigint;
                        tokensOwed0: bigint;
                        tokensOwed1: bigint;
                    };

                    const { token0, token1, fee, tickLower, tickUpper, liquidity, tokensOwed0, tokensOwed1 } = position;

                    const hasPosition = liquidity > 0n || tokensOwed0 > 0n || tokensOwed1 > 0n;
                    if (!hasPosition) continue;

                    if (tickLower >= tickUpper) {
                        console.warn(`Uniswap V3: skipping tokenId ${tokenId} due to invalid ticks`);
                        continue;
                    }

                    const tickLowerClamped = clampTick(tickLower);
                    const tickUpperClamped = clampTick(tickUpper);

                    const key = poolCacheKey(token0, token1, fee);

                    let poolAddress = poolAddressCache.get(key);
                    if (!poolAddress) {
                        const pool = (await publicClient.readContract({
                            address: UNISWAP_V3_FACTORY,
                            abi: UNISWAP_V3_FACTORY_ABI,
                            functionName: "getPool",
                            args: [token0, token1, fee],
                        })) as Address;

                        if (pool === "0x0000000000000000000000000000000000000000") {
                            console.warn(`Uniswap V3: no pool for tokenId ${tokenId}`);
                            continue;
                        }

                        poolAddress = pool;
                        poolAddressCache.set(key, poolAddress);
                    }

                    let slot0 = slot0Cache.get(poolAddress);
                    if (!slot0) {
                        const result = (await publicClient.readContract({
                            address: poolAddress,
                            abi: UNISWAP_V3_POOL_ABI,
                            functionName: "slot0",
                        })) as [bigint, number, number, number, number, number, boolean];

                        slot0 = { sqrtPriceX96: result[0] };
                        slot0Cache.set(poolAddress, slot0);
                    }

                    const sqrtRatioAX96 = getSqrtRatioAtTick(tickLowerClamped);
                    const sqrtRatioBX96 = getSqrtRatioAtTick(tickUpperClamped);

                    const { amount0, amount1 } = getAmountsForLiquidity(
                        slot0.sqrtPriceX96,
                        sqrtRatioAX96,
                        sqrtRatioBX96,
                        liquidity
                    );

                    if (amount0 === 0n && amount1 === 0n && tokensOwed0 === 0n && tokensOwed1 === 0n) {
                        continue;
                    }

                    const [token0Meta, token1Meta] = await Promise.all([
                        fetchTokenMetadata(CHAIN_ID, token0),
                        fetchTokenMetadata(CHAIN_ID, token1),
                    ]);

                    if (!token0Meta || !token1Meta) {
                        console.warn(`Uniswap V3: skipping tokenId ${tokenId} due to metadata failure`);
                        continue;
                    }

                    const supplied: Amount[] = [
                        { token: token0Meta, raw: amount0 },
                        { token: token1Meta, raw: amount1 },
                    ];

                    positions.push({
                        protocolId: this.id,
                        chainId: this.chainId,
                        label: `Uniswap V3 LP (#${tokenId}) · ${formatFeeTier(fee)} · [${tickLower}..${tickUpper}]`,
                        supplied,
                        updatedAt: Date.now(),
                    });
                } catch (error) {
                    console.warn("Uniswap V3: failed to process a position, skipping", error);
                }
            }

            return positions;
        } catch (error) {
            console.warn("Uniswap V3: failed to fetch positions", error);
            return [];
        }
    },
};
