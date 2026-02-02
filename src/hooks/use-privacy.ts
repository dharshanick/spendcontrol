"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface PrivacyState {
    isPrivacyMode: boolean;
    togglePrivacy: () => void;
}

export const usePrivacy = create<PrivacyState>()(
    persist(
        (set) => ({
            isPrivacyMode: false,
            togglePrivacy: () => set((state) => ({ isPrivacyMode: !state.isPrivacyMode })),
        }),
        {
            name: "privacy-storage",
            storage: createJSONStorage(() => {
                if (typeof window !== "undefined") {
                    return localStorage;
                }
                return {
                    getItem: () => null,
                    setItem: () => { },
                    removeItem: () => { },
                };
            }),
        }
    )
);
