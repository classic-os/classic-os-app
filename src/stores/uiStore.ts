import { create } from "zustand";
import { DEFAULT_CHAIN_ID } from "@/constants/chains";

interface UIState {
    selectedChainId: number;
    showTestnets: boolean;

    setSelectedChainId: (chainId: number) => void;
    toggleShowTestnets: () => void;

    // Optional but handy (lets UI set explicit values without toggling)
    setShowTestnets: (value: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
    selectedChainId: DEFAULT_CHAIN_ID,
    showTestnets: false,

    setSelectedChainId: (chainId) => set({ selectedChainId: chainId }),

    toggleShowTestnets: () => set((state) => ({ showTestnets: !state.showTestnets })),

    setShowTestnets: (value) => set({ showTestnets: value }),
}));
