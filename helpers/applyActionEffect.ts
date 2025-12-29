// helpers/applyActionEffects.ts
import type { Action } from '@/models/action';
import { RoleName } from '@/models/role';
import { useGameStore } from '@/stores/gameStore';

export function applyActionEffects(a: Action) {
  const store = useGameStore.getState();
  if (!store.game) return;

  const targetId = a.recipient?.[0]; // most of your actions are 1-target
  if (!targetId) return;

  switch (a.type) {
    case RoleName.Imp:
      store.killPlayer(targetId);
      return;

    case RoleName.Poisoner:
      store.setPoisoned(targetId, true);
      return;

    default:
      return;
  }
}
