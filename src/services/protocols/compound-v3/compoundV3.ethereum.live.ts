// src/services/protocols/compound-v3/compoundV3.ethereum.live.ts
import type { Address, Amount, ProtocolPosition, Token } from "@/types/domain";
import type { ProtocolService } from "../types";
import { createPublicClient, http } from "viem";
import { mainnet } from "viem/chains";
import { COMET_ABI } from "./abis/Comet";
import { ERC20_ABI } from "./abis/ERC20";

const PROTOCOL_ID = "compound-v3-eth" as const;
const PROTOCOL_NAME = "Compound V3" as const;
const CHAIN_ID = 1 as const;

// Canonical Compound V3 USDC Comet (Ethereum mainnet)
const COMPOUND_V3_USDC_COMET = "0xc3d688B66703497DAA39A0f29c3E84B6f93C3B99" as const;

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

type AssetInfo = {
    asset: Address;
};

export const CompoundV3EthereumLive: ProtocolService = {
    id: PROTOCOL_ID,
    name: PROTOCOL_NAME,
    chainId: CHAIN_ID,
    protocolType: "lending",

    // Read-only only (actions intentionally omitted until implemented)
    supports: {},

    async getUserPositions(address: Address): Promise<ProtocolPosition[]> {
        try {
            const [borrowBalance, baseTokenAddress, numAssetsRaw, isLiquidatable] = await Promise.all([
                publicClient.readContract({
                    address: COMPOUND_V3_USDC_COMET,
                    abi: COMET_ABI,
                    functionName: "borrowBalanceOf",
                    args: [address],
                }),
                publicClient.readContract({
                    address: COMPOUND_V3_USDC_COMET,
                    abi: COMET_ABI,
                    functionName: "baseToken",
                }),
                publicClient.readContract({
                    address: COMPOUND_V3_USDC_COMET,
                    abi: COMET_ABI,
                    functionName: "numAssets",
                }),
                publicClient.readContract({
                    address: COMPOUND_V3_USDC_COMET,
                    abi: COMET_ABI,
                    functionName: "isLiquidatable",
                    args: [address],
                }),
            ]);

            const numAssets = Number(numAssetsRaw);

            // Fetch all collateral asset info
            const assetInfoPromises: Promise<unknown>[] = [];
            for (let i = 0; i < numAssets; i++) {
                assetInfoPromises.push(
                    publicClient.readContract({
                        address: COMPOUND_V3_USDC_COMET,
                        abi: COMET_ABI,
                        functionName: "getAssetInfo",
                        args: [i],
                    })
                );
            }
            const assetInfos = await Promise.all(assetInfoPromises);

            // Extract collateral asset addresses
            const collateralAssets: Address[] = assetInfos.map((info) => (info as AssetInfo).asset);

            // Fetch collateral balances
            const collateralBalancePromises = collateralAssets.map((assetAddr) =>
                publicClient.readContract({
                    address: COMPOUND_V3_USDC_COMET,
                    abi: COMET_ABI,
                    functionName: "collateralBalanceOf",
                    args: [address, assetAddr],
                })
            );
            const collateralBalances = await Promise.all(collateralBalancePromises);

            // Build supplied amounts
            const supplied: Amount[] = [];
            for (let i = 0; i < collateralAssets.length; i++) {
                const balance = BigInt(collateralBalances[i] as unknown as bigint);
                if (balance > 0n) {
                    const token = await fetchTokenMetadata(CHAIN_ID, collateralAssets[i]);
                    if (token) {
                        supplied.push({ token, raw: balance });
                    }
                }
            }

            // Build borrowed amount (base token)
            const borrowed: Amount[] = [];
            const borrowBalanceBigInt = BigInt(borrowBalance as unknown as bigint);
            const baseTokenAddr = baseTokenAddress as Address;

            if (borrowBalanceBigInt > 0n) {
                const baseToken = await fetchTokenMetadata(CHAIN_ID, baseTokenAddr);
                if (baseToken) {
                    borrowed.push({ token: baseToken, raw: borrowBalanceBigInt });
                }
            }

            // If no collateral and no borrow, no position
            // Note: borrow-only is rare but must still return a position if borrowBalance > 0.
            if (supplied.length === 0 && borrowed.length === 0) {
                return [];
            }

            // IMPORTANT: Do not fabricate a "health factor".
            // Compound V3 does not expose a direct health factor like Aave.
            // We currently *only* know whether the account is liquidatable.
            // TODO: compute a meaningful health metric (e.g., borrowing power / liquidity) before surfacing health fields.
            void isLiquidatable;

            return [
                {
                    protocolId: this.id,
                    chainId: this.chainId,
                    label: this.name,
                    supplied: supplied.length > 0 ? supplied : undefined,
                    borrowed: borrowed.length > 0 ? borrowed : undefined,
                    updatedAt: Date.now(),
                },
            ];
        } catch (error) {
            console.warn("Failed to fetch Compound V3 positions:", error);
            return [];
        }
    },
};
