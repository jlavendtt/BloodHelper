import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type PlayerId = string;

export interface Player {
  id: PlayerId;
  name: string;
  phone: string;
}

function uid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

const norm = (s: string) => s.trim().toLowerCase();

interface PlayersState {
  players: Player[];

  // history (names shown in UI)
  nameHistory: string[];

  // phone memory keyed by normalized name
  historyPhones: Record<string, string>;

  addPlayer: (name: string, phone?: string) => void;
  addFromHistory: (name: string) => void;
  removePlayer: (id: PlayerId) => void;

  updatePlayer: (
    id: PlayerId,
    patch: Partial<Pick<Player, 'name' | 'phone'>>
  ) => void;

  clearPlayers: () => void;
  seedIfEmpty: () => void;
  historyAvailable: () => string[];
  removeFromHistory: (name: string) => void;
}

type PersistShape = Pick<
  PlayersState,
  'players' | 'nameHistory' | 'historyPhones'
>;

export const usePlayersStore = create<PlayersState>()(
  persist(
    (set, get) => ({
      players: [],

      nameHistory: ['justin', 'thomas', 'peter', 'sungho', 'julia', 'jill'],

      historyPhones: {},

      addPlayer: (name, phone = '') => {
        const trimmed = name.trim();
        const trimmedPhone = (phone ?? '').trim();
        if (!trimmed) return;

        set((state) => {
          const key = norm(trimmed);

          const byName = new Set(state.nameHistory.map(norm));
          const nameHistory = byName.has(key)
            ? state.nameHistory
            : [...state.nameHistory, trimmed];

          const historyPhones = { ...state.historyPhones };
          historyPhones[key] = trimmedPhone ?? '';

          return {
            players: [
              ...state.players,
              { id: uid(), name: trimmed, phone: trimmedPhone },
            ],
            nameHistory,
            historyPhones,
          };
        });
      },

      addFromHistory: (name) => {
        const trimmed = name.trim();
        if (!trimmed) return;

        set((state) => {
          const exists = state.players.some(
            (p) => norm(p.name) === norm(trimmed)
          );
          if (exists) return { players: state.players };

          const key = norm(trimmed);
          const phone = state.historyPhones?.[key] ?? '';

          return {
            players: [
              ...state.players,
              { id: uid(), name: trimmed, phone },
            ],
          };
        });
      },

      removePlayer: (id) =>
        set((state) => ({
          players: state.players.filter((p) => p.id !== id),
        })),

      updatePlayer: (id, patch) =>
        set((state) => {
          const target = state.players.find((p) => p.id === id);
          if (!target) return state;

          const nextName = patch.name?.trim();
          const nextPhone = patch.phone?.trim();

          const oldKey = norm(target.name);
          const newKey = norm(nextName ?? target.name);

          const players = state.players.map((p) =>
            p.id === id
              ? {
                  ...p,
                  name: nextName ? nextName : p.name,
                  phone:
                    nextPhone !== undefined ? nextPhone : p.phone,
                }
              : p
          );

          let nameHistory = state.nameHistory;
          if (nextName) {
            const byName = new Set(state.nameHistory.map(norm));
            if (!byName.has(newKey)) {
              nameHistory = [...state.nameHistory, nextName];
            }
          }

          const historyPhones = { ...state.historyPhones };

          // move phone entry if renamed
          if (newKey !== oldKey) {
            if (!(newKey in historyPhones)) {
              historyPhones[newKey] = historyPhones[oldKey] ?? '';
            }
            delete historyPhones[oldKey];
          }

          if (nextPhone !== undefined) {
            historyPhones[newKey] = nextPhone;
          } else if (!(newKey in historyPhones)) {
            historyPhones[newKey] = '';
          }

          return { players, nameHistory, historyPhones };
        }),

      clearPlayers: () => set({ players: [] }),

      seedIfEmpty: () => {
        const { players } = get();
        if (players.length === 0) {
          const seeds = ['Jesse', 'Kendal', 'Peter', 'Thomas'];
          set((state) => {
            const historyPhones = { ...state.historyPhones };
            seeds.forEach((n) => {
              const k = norm(n);
              if (!(k in historyPhones)) historyPhones[k] = '';
            });

            return {
              players: seeds.map((n) => ({
                id: uid(),
                name: n,
                phone: '',
              })),
              nameHistory: Array.from(
                new Set([...state.nameHistory, ...seeds])
              ),
              historyPhones,
            };
          });
        }
      },

      historyAvailable: () => {
        const { players, nameHistory } = get();
        const current = new Set(players.map((p) => norm(p.name)));
        return nameHistory.filter((n) => !current.has(norm(n)));
      },

      removeFromHistory: (name) =>
        set((state) => {
          const key = norm(name);
          const historyPhones = { ...state.historyPhones };
          delete historyPhones[key];

          return {
            nameHistory: state.nameHistory.filter(
              (n) => norm(n) !== key
            ),
            historyPhones,
          };
        }),
    }),
    {
      name: 'botc-players-store-v3',
      storage: createJSONStorage(() => AsyncStorage),

      partialize: (s): PersistShape => ({
        players: s.players,
        nameHistory: s.nameHistory,
        historyPhones: s.historyPhones,
      }),

      migrate: (persisted: unknown) => {
        const p = persisted as any;

        const players = Array.isArray(p?.players)
          ? p.players.map((pl: any) => ({
              id: String(pl.id),
              name: String(pl.name ?? ''),
              phone:
                typeof pl.phone === 'string' ? pl.phone : '',
            }))
          : [];

        const nameHistory = Array.isArray(p?.nameHistory)
          ? p.nameHistory.map(String)
          : [];

        const historyPhones =
          p?.historyPhones && typeof p.historyPhones === 'object'
            ? p.historyPhones
            : {};

        return { players, nameHistory, historyPhones };
      },
    }
  )
);
