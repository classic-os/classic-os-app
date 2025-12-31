import { create } from "zustand";
import { DEFAULT_CHAIN_ID } from "@/constants/chains";

export interface UIState {
    selectedChainId: number;
    showTestnets: boolean;

    setSelectedChainId: (chainId: number) => void;
    toggleShowTestnets: () => void;
    setShowTestnets: (value: boolean) => void;
}

export const useUIStore = create<UIState>()((set) => ({
    selectedChainId: DEFAULT_CHAIN_ID,
    showTestnets: false,

    setSelectedChainId: (chainId: number) => set({ selectedChainId: chainId }),

    toggleShowTestnets: () =>
        set((state) => ({ showTestnets: !state.showTestnets })),

    setShowTestnets: (value: boolean) => set({ showTestnets: value }),
}));
