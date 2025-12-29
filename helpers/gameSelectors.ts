// helpers/gameSelectors.ts
import type { Game, PlayerStatus } from '@/stores/gameStore';

/**
 * Safely get a player's status object
 */
export function getPlayerStatus(
  game: Game | null | undefined,
  playerId: string
): PlayerStatus | undefined {
  return game?.playerStateById[playerId];
}

/**
 * Is the player dead?
 */
export function isDead(
  game: Game | null | undefined,
  playerId: string
): boolean {
  const status = getPlayerStatus(game, playerId);
  return status ? !status.alive : false;
}

/**
 * Is the player alive?
 */
export function isAlive(
  game: Game | null | undefined,
  playerId: string
): boolean {
  return !isDead(game, playerId);
}

/**
 * Is the player poisoned?
 */
export function isPoisoned(
  game: Game | null | undefined,
  playerId: string
): boolean {
  return !!getPlayerStatus(game, playerId)?.poisoned;
}

/**
 * Is the player drunk?
 */
export function isDrunk(
  game: Game | null | undefined,
  playerId: string
): boolean {
  return !!getPlayerStatus(game, playerId)?.drunk;
}

/**
 * Any temporary impairment (poison OR drunk)
 */
export function isImpaired(
  game: Game | null | undefined,
  playerId: string
): boolean {
  const status = getPlayerStatus(game, playerId);
  return !!(status?.poisoned || status?.drunk);
}
