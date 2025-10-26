// stores/playersStore.ts — global players list with add/remove/rename (persisted)
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type PlayerId = string;
export interface Player { id: PlayerId; name: string }

function uid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

interface PlayersState {
  players: Player[];
  addPlayer: (name: string) => void;
  removePlayer: (id: PlayerId) => void;
  renamePlayer: (id: PlayerId, name: string) => void;
  clearPlayers: () => void;
  /** convenience: seed a few players the first time */
  seedIfEmpty: () => void;
}

export const usePlayersStore = create<PlayersState>()(
  persist(
    (set, get) => ({
      players: [],

      addPlayer: (name) =>
        set((state) => ({
          players: [...state.players, { id: uid(), name: name.trim() || 'Player' }],
        })),

      removePlayer: (id) =>
        set((state) => ({
          players: state.players.filter((p) => p.id !== id),
        })),

      renamePlayer: (id, name) =>
        set((state) => ({
          players: state.players.map((p) => (p.id === id ? { ...p, name } : p)),
        })),

      clearPlayers: () => set({ players: [] }),

      seedIfEmpty: () => {
        const { players } = get();
        if (players.length === 0) {
          set({
            players: [
              { id: uid(), name: 'Alice' },
              { id: uid(), name: 'Bob' },
              { id: uid(), name: 'Charlie' },
              { id: uid(), name: 'Daisy' },
              { id: uid(), name: 'Eve' },
            ],
          });
        }
      },
    }),
    {
      name: 'botc-players-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ players: s.players }),
    }
  )
);
