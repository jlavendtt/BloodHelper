// stores/playersStore.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type PlayerId = string;
export interface Player { id: PlayerId; name: string }

function uid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
const norm = (s: string) => s.trim().toLowerCase();

interface PlayersState {
  players: Player[];
  nameHistory: string[];

  addPlayer: (name: string) => void;
  addFromHistory: (name: string) => void;
  removePlayer: (id: PlayerId) => void;
  renamePlayer: (id: PlayerId, name: string) => void;
  clearPlayers: () => void;
  seedIfEmpty: () => void;
  historyAvailable: () => string[];

  removeFromHistory: (name: string) => void; // 👈 NEW
}

export const usePlayersStore = create<PlayersState>()(
  persist(
    (set, get) => ({
      players: [],
      // 👇 Hardcoded initial names in history
      nameHistory: ['justin','thomas','peter','sungho','julia','jill'],

      addPlayer: (name) => {
        const trimmed = name.trim();
        if (!trimmed) return;
        set((state) => {
          const byName = new Set(state.nameHistory.map(norm));
          if (!byName.has(norm(trimmed))) {
            state.nameHistory = [...state.nameHistory, trimmed];
          }
          return { players: [...state.players, { id: uid(), name: trimmed }], nameHistory: state.nameHistory };
        });
      },

      addFromHistory: (name) => {
        const trimmed = name.trim();
        if (!trimmed) return;
        set((state) => {
          const exists = state.players.some((p) => norm(p.name) === norm(trimmed));
          if (exists) return { players: state.players };
          return { players: [...state.players, { id: uid(), name: trimmed }] };
        });
      },

      removePlayer: (id) =>
        set((state) => ({ players: state.players.filter((p) => p.id !== id) })),

      renamePlayer: (id, name) =>
        set((state) => {
          const trimmed = name.trim();
          const players = state.players.map((p) => (p.id === id ? { ...p, name: trimmed || p.name } : p));
          if (trimmed) {
            const byName = new Set(state.nameHistory.map(norm));
            if (!byName.has(norm(trimmed))) {
              return { players, nameHistory: [...state.nameHistory, trimmed] };
            }
          }
          return { players };
        }),

      clearPlayers: () => set({ players: [] }),

      seedIfEmpty: () => {
        const { players } = get();
        if (players.length === 0) {
          const seeds = ['Jesse', 'Kendal', 'Peter', 'Thomas',];
          set((state) => ({
            players: seeds.map((n) => ({ id: uid(), name: n })),
            // keep hardcoded names + add seeds if missing
            nameHistory: Array.from(new Set([...state.nameHistory, ...seeds])),
          }));
        }
      },

      historyAvailable: () => {
        const { players, nameHistory } = get();
        const current = new Set(players.map((p) => norm(p.name)));
        return nameHistory.filter((n) => !current.has(norm(n)));
      },

      // 👇 NEW: remove an entry from the history list
      removeFromHistory: (name) =>
        set((state) => ({
          nameHistory: state.nameHistory.filter((n) => norm(n) !== norm(name)),
        })),
    }),
    {
      name: 'botc-players-store-v2',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ players: s.players, nameHistory: s.nameHistory }),
    }
  )
);
