// helpers/gameActions.ts
import { useGameStore } from '@/stores/gameStore';

/**
 * Kill a player
 */
export function killPlayer(playerId: string) {
  useGameStore.getState().killPlayer(playerId);
}

/**
 * Revive a player
 */
export function revivePlayer(playerId: string) {
  useGameStore.getState().revivePlayer(playerId);
}

/**
 * Set poisoned state
 */
export function setPoisoned(playerId: string, poisoned: boolean) {
  useGameStore.getState().setPoisoned(playerId, poisoned);
}

/**
 * Set drunk state
 */
export function setDrunk(playerId: string, drunk: boolean) {
  useGameStore.getState().setDrunk(playerId, drunk);
}

/**
 * Generic status patch (escape hatch)
 */
export function setPlayerStatus(
  playerId: string,
  patch: Partial<{
    alive: boolean;
    poisoned: boolean;
    drunk: boolean;
  }>
) {
  useGameStore.getState().setPlayerStatus(playerId, patch);
}

/**
 * Clear poison + drunk from all players
 * (call at start of new night/day)
 */
export function resetTemporaryStatuses() {
  useGameStore.getState().resetTemporaryStatuses();
}
