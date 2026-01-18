"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface GameState {
    score: number;
    highScore: number;
    setScore: (points: number) => void;
    addPoints: (points: number) => void;
    resetScore: () => void;
}

export const useGame = create<GameState>()(
    persist(
        (set) => ({
            score: 0,       // Current active score
            highScore: 0,   // Best score ever

            setScore: (points) => set((state) => ({
                score: points,
                highScore: Math.max(points, state.highScore)
            })),

            addPoints: (points) => set((state) => {
                const newScore = state.score + points;
                return {
                    score: newScore,
                    highScore: Math.max(newScore, state.highScore)
                };
            }),

            resetScore: () => set({ score: 0 }),
        }),
        {
            name: "game-storage", // Unique name for local storage
            storage: createJSONStorage(() => localStorage),
        }
    )
);
