// stores/gameStore.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { Action } from '@/models/action';
import type { RoleName } from '@/models/role';

export type Player = { id: string; name: string };
export type WhoWon = 'Good' | 'Evil';
export type RoundId = string; // "N1", "N2", ... (for now)

export type Round = {
  id: RoundId;
  actionsByRole: Partial<Record<RoleName, Action>>; // overwrite per role
};

export type PlayerStatus = {
  alive: boolean; // dead = false
  poisoned?: boolean;
  drunk?: boolean;

  // easy future adds:
  // protected?: boolean;
  // deadNight?: RoundId;
};

export type Game = {
  players: Player[];
  whoWon: WhoWon | null;

  currentRoundId: RoundId;
  roundsById: Record<RoundId, Round>;

  // ✅ per-game, per-player current state
  playerStateById: Record<Player['id'], PlayerStatus>;
};

interface GameState {
  game: Game | null;

  // game lifecycle
  startNewGame: (players: Player[]) => void;
  setWhoWon: (whoWon: WhoWon | null) => void;

  // rounds
  setRound: (roundId: RoundId) => void;
  nextNight: () => void;
  resetCurrentRoundActions: () => void;

  // actions (overwrite by role)
  upsertAction: (action: Action) => void;

  // ✅ player status
  setPlayerStatus: (playerId: string, patch: Partial<PlayerStatus>) => void;
  killPlayer: (playerId: string) => void;
  revivePlayer: (playerId: string) => void;
  setPoisoned: (playerId: string, poisoned: boolean) => void;
  setDrunk: (playerId: string, drunk: boolean) => void;

  // optional helper: clear "temporary" flags (poison/drunk) for a new night/day
  resetTemporaryStatuses: () => void;

  // helpers
  clearGame: () => void;
}

function makeNightId(nightNumber: number): RoundId {
  return `N${nightNumber}`;
}

function parseNightNumber(roundId: RoundId): number {
  // expects "N<number>", falls back to 1
  const m = /^N(\d+)$/.exec(roundId);
  if (!m) return 1;
  const num = Number(m[1]);
  return Number.isFinite(num) && num > 0 ? num : 1;
}

function ensureRound(game: Game, roundId: RoundId): Game {
  if (game.roundsById[roundId]) return game;
  return {
    ...game,
    roundsById: {
      ...game.roundsById,
      [roundId]: { id: roundId, actionsByRole: {} },
    },
  };
}

function buildInitialPlayerState(players: Player[]): Record<string, PlayerStatus> {
  // everyone alive at game start
  return Object.fromEntries(players.map((p) => [p.id, { alive: true }]));
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      game: null,

      startNewGame: (players) => {
        const firstRoundId = makeNightId(1);

        const game: Game = {
          players,
          whoWon: null,
          currentRoundId: firstRoundId,
          roundsById: {
            [firstRoundId]: { id: firstRoundId, actionsByRole: {} },
          },
          playerStateById: buildInitialPlayerState(players),
        };

        set({ game });
      },

      setWhoWon: (whoWon) =>
        set((state) =>
          state.game ? { game: { ...state.game, whoWon } } : state
        ),

      setRound: (roundId) =>
        set((state) => {
          if (!state.game) return state;
          const nextGame = ensureRound(state.game, roundId);
          return { game: { ...nextGame, currentRoundId: roundId } };
        }),

      nextNight: () =>
        set((state) => {
          if (!state.game) return state;

          const cur = parseNightNumber(state.game.currentRoundId);
          const nextId = makeNightId(cur + 1);

          const withRound = ensureRound(state.game, nextId);

          // ✅ start fresh each new night (keeps previous nights in roundsById)
          return {
            game: {
              ...withRound,
              currentRoundId: nextId,
              roundsById: {
                ...withRound.roundsById,
                [nextId]: { id: nextId, actionsByRole: {} },
              },
            },
          };
        }),

      resetCurrentRoundActions: () =>
        set((state) => {
          if (!state.game) return state;
          const { currentRoundId } = state.game;
          const withRound = ensureRound(state.game, currentRoundId);
          return {
            game: {
              ...withRound,
              roundsById: {
                ...withRound.roundsById,
                [currentRoundId]: { id: currentRoundId, actionsByRole: {} },
              },
            },
          };
        }),

      upsertAction: (action) =>
        set((state) => {
          if (!state.game) return state;

          const roundId = state.game.currentRoundId;
          const withRound = ensureRound(state.game, roundId);
          const curRound = withRound.roundsById[roundId];

          return {
            game: {
              ...withRound,
              roundsById: {
                ...withRound.roundsById,
                [roundId]: {
                  ...curRound,
                  actionsByRole: {
                    ...curRound.actionsByRole,
                    [action.type]: action, // overwrite previous action for this role
                  },
                },
              },
            },
          };
        }),

      // -------------------------
      // ✅ player status helpers
      // -------------------------
      setPlayerStatus: (playerId, patch) =>
        set((state) => {
          if (!state.game) return state;

          const cur = state.game.playerStateById[playerId] ?? { alive: true };

          return {
            game: {
              ...state.game,
              playerStateById: {
                ...state.game.playerStateById,
                [playerId]: { ...cur, ...patch },
              },
            },
          };
        }),

      killPlayer: (playerId) => {
        get().setPlayerStatus(playerId, { alive: false });
      },

      revivePlayer: (playerId) => {
        get().setPlayerStatus(playerId, { alive: true });
      },

      setPoisoned: (playerId, poisoned) => {
        get().setPlayerStatus(playerId, { poisoned });
      },

      setDrunk: (playerId, drunk) => {
        get().setPlayerStatus(playerId, { drunk });
      },

      resetTemporaryStatuses: () =>
        set((state) => {
          if (!state.game) return state;

          const next = { ...state.game.playerStateById };
          for (const id of Object.keys(next)) {
            next[id] = { ...next[id], poisoned: false, drunk: false };
          }

          return {
            game: {
              ...state.game,
              playerStateById: next,
            },
          };
        }),

      clearGame: () => set({ game: null }),
    }),
    {
      name: 'botc-game-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ game: state.game }),
    }
  )
);
