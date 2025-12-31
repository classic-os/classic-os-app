export const DEFAULT_CHAIN_ID = 1 as const;

export type ChainMeta = {
    id: number;
    name: string;
    isTestnet: boolean;
};

export const CHAINS: ChainMeta[] = [
    { id: 1, name: "Ethereum Mainnet", isTestnet: false },
    { id: 11155111, name: "Sepolia", isTestnet: true },
];

export function getChainMeta(id: number): ChainMeta | undefined {
    return CHAINS.find((c) => c.id === id);
}
