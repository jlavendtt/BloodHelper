// utils/roleDistribution.ts
import { Affiliation, RoleName } from '@/models/role';
import { rolesList } from '@/models/rolesList';

export type RoleDistribution = {
  townsfolk: number;
  outsiders: number;
  minions: number;
  demons: number;
};

export type RoleStatusRow = {
  required: number;
  actual: number;
  delta: number; // required - actual (positive => need more)
  ok: boolean;
};

export type RoleStatus = {
  townsfolk: RoleStatusRow;
  outsiders: RoleStatusRow;
  minions: RoleStatusRow;
  demons: RoleStatusRow;
};

export type AssignedMap = Record<string, RoleName | undefined>;

/** Chart from the official player count table (5..15+). */
export function getRoleDistribution(players: number): RoleDistribution {
  if (players === 5) return { townsfolk: 3, outsiders: 0, minions: 1, demons: 1 };
  else if (players === 6) return { townsfolk: 3, outsiders: 1, minions: 1, demons: 1 };
  else if (players === 7) return { townsfolk: 5, outsiders: 0, minions: 1, demons: 1 };
  else if (players === 8) return { townsfolk: 5, outsiders: 1, minions: 1, demons: 1 };
  else if (players === 9) return { townsfolk: 5, outsiders: 2, minions: 1, demons: 1 };
  else if (players === 10) return { townsfolk: 7, outsiders: 0, minions: 2, demons: 1 };
  else if (players === 11) return { townsfolk: 7, outsiders: 1, minions: 2, demons: 1 };
  else if (players === 12) return { townsfolk: 7, outsiders: 2, minions: 2, demons: 1 };
  else if (players === 13) return { townsfolk: 9, outsiders: 0, minions: 3, demons: 1 };
  else if (players === 14) return { townsfolk: 9, outsiders: 1, minions: 3, demons: 1 };
  else if (players >= 15) return { townsfolk: 9, outsiders: 2, minions: 3, demons: 1 };

  // If you allow <5 players, treat as "no requirements"
  return { townsfolk: 0, outsiders: 0, minions: 0, demons: 0 };
}

/** Set of currently occupied role names (assigned to any player). */
export function getOccupiedRoles(assigned: AssignedMap): Set<RoleName> {
  const set = new Set<RoleName>();
  for (const role of Object.values(assigned)) {
    if (role) set.add(role);
  }
  return set;
}

/** Counts actual assigned roles by affiliation using rolesList metadata. */
export function countAssignedByAffiliation(assigned: AssignedMap) {
  const roleToAff = new Map<RoleName, Affiliation>();
  for (const r of rolesList) roleToAff.set(r.title as RoleName, r.affiliation);

  const actual = { townsfolk: 0, outsiders: 0, minions: 0, demons: 0 };

  for (const role of Object.values(assigned)) {
    if (!role) continue;
    const aff = roleToAff.get(role);
    if (!aff) continue;

    if (aff === Affiliation.Townsfolk) actual.townsfolk += 1;
    else if (aff === Affiliation.Outsider) actual.outsiders += 1;
    else if (aff === Affiliation.Minion) actual.minions += 1;
    else if (aff === Affiliation.Demon) actual.demons += 1;
  }

  return actual;
}

/** Required vs actual + delta + ok for each faction. */
export function getRoleStatus(players: number, assigned: AssignedMap): RoleStatus {
  const required = getRoleDistribution(players);
  const actual = countAssignedByAffiliation(assigned);

  const mk = (req: number, act: number): RoleStatusRow => {
    const delta = req - act;
    return { required: req, actual: act, delta, ok: delta === 0 };
  };

  return {
    townsfolk: mk(required.townsfolk, actual.townsfolk),
    outsiders: mk(required.outsiders, actual.outsiders),
    minions: mk(required.minions, actual.minions),
    demons: mk(required.demons, actual.demons),
  };
}
