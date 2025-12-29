// hooks/usePlayerStatus.ts
import type { PlayerStatus } from '@/stores/gameStore';
import { useGameStore } from '@/stores/gameStore';
import { useMemo } from 'react';

export type UsePlayerStatusResult = {
  status: PlayerStatus | undefined;

  isDead: boolean;
  isAlive: boolean;
  isPoisoned: boolean;
  isDrunk: boolean;
  isImpaired: boolean;

  // actions
  kill: () => void;
  revive: () => void;
  setPoisoned: (poisoned: boolean) => void;
  setDrunk: (drunk: boolean) => void;
  patch: (patch: Partial<PlayerStatus>) => void;
};

/**
 * Usage:
 * const ps = usePlayerStatus(player.id)
 * ps.isDead, ps.isPoisoned, ps.kill(), ps.setPoisoned(true), etc.
 */
export function usePlayerStatus(playerId: string): UsePlayerStatusResult {
  // read status
  const status = useGameStore((s) => s.game?.playerStateById[playerId]);

  // actions
  const killPlayer = useGameStore((s) => s.killPlayer);
  const revivePlayer = useGameStore((s) => s.revivePlayer);
  const setPoisoned = useGameStore((s) => s.setPoisoned);
  const setDrunk = useGameStore((s) => s.setDrunk);
  const setPlayerStatus = useGameStore((s) => s.setPlayerStatus);

  // derived booleans
  const derived = useMemo(() => {
    const isDead = status ? !status.alive : false;
    const isAlive = !isDead;
    const isPoisoned = !!status?.poisoned;
    const isDrunk = !!status?.drunk;
    const isImpaired = isPoisoned || isDrunk;

    return { isDead, isAlive, isPoisoned, isDrunk, isImpaired };
  }, [status]);

  return {
    status,

    ...derived,

    kill: () => killPlayer(playerId),
    revive: () => revivePlayer(playerId),
    setPoisoned: (poisoned) => setPoisoned(playerId, poisoned),
    setDrunk: (drunk) => setDrunk(playerId, drunk),
    patch: (patch) => setPlayerStatus(playerId, patch),
  };
}
