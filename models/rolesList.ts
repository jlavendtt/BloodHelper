// models/rolesList.ts
import { ImageSourcePropType } from 'react-native';
import type { Action } from './action';
import { Affiliation, RoleName } from './role';

export interface Role {
  affiliation: Affiliation;
  title: RoleName;
  picture: ImageSourcePropType;
  prompt: string;

  // ✅ ID-first: roles receive ids + a getName() resolver for display text
  doAction: (args: {
    actorId: string;
    recipientIds?: string[];
    getName: (id: string) => string;

    result?: boolean;
    isDrunk?: boolean;
    roleToken?: RoleName;
    number?: number;
  }) => Action;
}

function drunkSuffix(isDrunk?: boolean) {
  return isDrunk ? ' (Drunk)' : '';
}

function joinNamesFromIds(ids: string[] | undefined, getName: (id: string) => string) {
  const names = (ids ?? []).map(getName).filter(Boolean);
  if (names.length === 0) return '';
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(', ')}, and ${names[names.length - 1]}`;
}

function baseAction(args: {
  role: RoleName;
  actorId: string;
  recipientIds?: string[];
  result?: boolean;
  isDrunk?: boolean;
  roleToken?: RoleName;
  number?: number;
  text: string;
}): Action {
  const { role, actorId, recipientIds, result, isDrunk = false, roleToken, number, text } = args;

  return {
    actorPlayerId: actorId, // ✅ always id now
    type: role,
    text: `${text}${drunkSuffix(isDrunk)}`,
    recipient: recipientIds?.length ? recipientIds : undefined,
    result,
    roleToken,
    number,
    wasDrunk: isDrunk,
  };
}

// --- Helper makers (Washerwoman/Librarian/Investigator share) ---
function infoPairWithToken(role: RoleName) {
  return (args: {
    actorId: string;
    recipientIds?: string[];
    getName: (id: string) => string;
    isDrunk?: boolean;
    roleToken?: RoleName;
  }): Action => {
    const { actorId, recipientIds = [], getName, isDrunk = false, roleToken } = args;

    const p1 = recipientIds[0];
    const p2 = recipientIds[1];
    const pair = joinNamesFromIds([p1, p2].filter(Boolean) as string[], getName);

    const actorName = getName(actorId);
    const tokenText = roleToken ? String(roleToken) : 'UNKNOWN';

    const text = `${actorName}: was shown that ${pair || 'two players'} and found one of them was ${tokenText}`;

    return baseAction({
      role,
      actorId,
      recipientIds,
      isDrunk,
      roleToken,
      text,
    });
  };
}

function singleTarget(role: RoleName, verb: string) {
  return (args: {
    actorId: string;
    recipientIds?: string[];
    getName: (id: string) => string;
    isDrunk?: boolean;
  }): Action => {
    const { actorId, recipientIds = [], getName, isDrunk = false } = args;

    const actorName = getName(actorId);
    const targetId = recipientIds[0];
    const targetName = targetId ? getName(targetId) : 'someone';

    const text = `${actorName}: ${verb} ${targetName}`;

    return baseAction({ role, actorId, recipientIds, isDrunk, text });
  };
}

export const rolesList: Role[] = [
  // 🧑‍🌾 Townsfolk
  {
    affiliation: Affiliation.Townsfolk,
    title: RoleName.Washerwoman,
    picture: require('@/assets/roles/washerwoman.png'),
    prompt: 'Here is who is townsfolk',
    doAction: infoPairWithToken(RoleName.Washerwoman),
  },
  {
    affiliation: Affiliation.Townsfolk,
    title: RoleName.Librarian,
    picture: require('@/assets/roles/librarian.png'),
    prompt: 'Heres the outsiders',
    doAction: infoPairWithToken(RoleName.Librarian),
  },
  {
    affiliation: Affiliation.Townsfolk,
    title: RoleName.Investigator,
    picture: require('@/assets/roles/investigator.png'),
    prompt: 'Heres is a particular minion',
    doAction: infoPairWithToken(RoleName.Investigator),
  },
  {
    affiliation: Affiliation.Townsfolk,
    title: RoleName.Chef,
    picture: require('@/assets/roles/chef.png'),
    prompt: 'here are the pairs',
    doAction: ({ actorId, getName, result, isDrunk = false, number }): Action => {
      const actorName = getName(actorId);

      const pairsText =
        typeof number === 'number'
          ? `${number} pair${number === 1 ? '' : 's'}`
          : typeof result === 'boolean'
            ? result
              ? 'pairs'
              : 'no pairs'
            : 'UNKNOWN';

      const text = `${actorName}: was alerted that there are ${pairsText}`;

      return baseAction({
        role: RoleName.Chef,
        actorId,
        result,
        isDrunk,
        number,
        text,
      });
    },
  },
  {
    affiliation: Affiliation.Townsfolk,
    title: RoleName.Empath,
    picture: require('@/assets/roles/empath.png'),
    prompt: 'heres number of sus people',
    doAction: ({ actorId, getName, isDrunk = false, number }): Action => {
      const actorName = getName(actorId);
      const nText = typeof number === 'number' ? String(number) : 'UNKNOWN';
      const text = `${actorName}: was alerted that there are ${nText} bad players next to them`;

      return baseAction({
        role: RoleName.Empath,
        actorId,
        isDrunk,
        number,
        text,
      });
    },
  },
  {
    affiliation: Affiliation.Townsfolk,
    title: RoleName.FortuneTeller,
    picture: require('@/assets/roles/fortune_teller.png'),
    prompt: 'Choose 2 players to fortune tell',
    doAction: ({ actorId, recipientIds = [], getName, result, isDrunk = false }): Action => {
      const actorName = getName(actorId);

      const p1 = recipientIds[0];
      const p2 = recipientIds[1];
      const pair = joinNamesFromIds([p1, p2].filter(Boolean) as string[], getName);

      const resText = typeof result === 'boolean' ? (result ? 'YES' : 'NO') : 'UNKNOWN';
      const text = `${actorName}: chose ${pair || 'two players'} and got ${resText}`;

      return baseAction({
        role: RoleName.FortuneTeller,
        actorId,
        recipientIds,
        result,
        isDrunk,
        text,
      });
    },
  },
  {
    affiliation: Affiliation.Townsfolk,
    title: RoleName.Undertaker,
    picture: require('@/assets/roles/undertaker.png'),
    prompt: 'Heres the token of the player that was executed today',
    doAction: ({ actorId, recipientIds = [], getName, isDrunk = false, roleToken }): Action => {
      const actorName = getName(actorId);

      const executedId = recipientIds[0];
      const executedName = executedId ? getName(executedId) : 'the executed player';

      const tokenText = roleToken ? String(roleToken) : 'UNKNOWN';
      const text = `${actorName}: was shown that ${executedName} was ${tokenText}`;

      return baseAction({
        role: RoleName.Undertaker,
        actorId,
        recipientIds,
        isDrunk,
        roleToken,
        text,
      });
    },
  },
  {
    affiliation: Affiliation.Townsfolk,
    title: RoleName.Monk,
    picture: require('@/assets/roles/monk.png'),
    prompt: 'Choose someone to save',
    doAction: singleTarget(RoleName.Monk, 'protected'),
  },
  {
    affiliation: Affiliation.Townsfolk,
    title: RoleName.Ravenkeeper,
    picture: require('@/assets/roles/ravenkeeper.png'),
    prompt: 'Choose a player to learn their identity',
    doAction: ({ actorId, recipientIds = [], getName, isDrunk = false, roleToken }): Action => {
      const actorName = getName(actorId);

      const targetId = recipientIds[0];
      const targetName = targetId ? getName(targetId) : 'someone';

      const tokenText = roleToken ? String(roleToken) : 'UNKNOWN';
      const text = `${actorName}: learned that ${targetName}'s role was ${tokenText}`;

      return baseAction({
        role: RoleName.Ravenkeeper,
        actorId,
        recipientIds,
        isDrunk,
        roleToken,
        text,
      });
    },
  },
  {
    affiliation: Affiliation.Townsfolk,
    title: RoleName.Virgin,
    picture: require('@/assets/roles/virgin.png'),
    prompt: '',
    doAction: singleTarget(RoleName.Virgin, 'killed'),
  },
  {
    affiliation: Affiliation.Townsfolk,
    title: RoleName.Slayer,
    picture: require('@/assets/roles/slayer.png'),
    prompt: '',
    doAction: ({ actorId, recipientIds = [], getName, result, isDrunk = false }): Action => {
      const actorName = getName(actorId);

      const targetId = recipientIds[0];
      const targetName = targetId ? getName(targetId) : 'someone';

      const successText =
        typeof result === 'boolean'
          ? result
            ? `successfully killed ${targetName}`
            : `failed to kill ${targetName}`
          : `shot at ${targetName}`;

      const text = `${actorName}: ${successText}`;

      return baseAction({
        role: RoleName.Slayer,
        actorId,
        recipientIds,
        result,
        isDrunk,
        text,
      });
    },
  },
  {
    affiliation: Affiliation.Townsfolk,
    title: RoleName.Soldier,
    picture: require('@/assets/roles/soldier.png'),
    prompt: '',
    doAction: ({ actorId, recipientIds = [], getName, isDrunk = false }): Action => {
      const actorName = getName(actorId);

      const attackerId = recipientIds[0];
      const attackerName = attackerId ? getName(attackerId) : 'someone';

      const text = `${actorName}: defended themself against ${attackerName}`;

      return baseAction({
        role: RoleName.Soldier,
        actorId,
        recipientIds,
        isDrunk,
        text,
      });
    },
  },
  {
    affiliation: Affiliation.Townsfolk,
    title: RoleName.Mayor,
    picture: require('@/assets/roles/mayor.png'),
    prompt: '',
    doAction: ({ actorId, recipientIds = [], getName, isDrunk = false }): Action => {
      const mayorName = getName(actorId);

      const attackerId = recipientIds[0];
      const diedInsteadId = recipientIds[1];

      const attackerName = attackerId ? getName(attackerId) : 'someone';
      const diedInsteadName = diedInsteadId ? getName(diedInsteadId) : 'someone else';

      const text = `${attackerName} tried to kill ${mayorName} (Mayor) and ${diedInsteadName} died in the process`;

      return baseAction({
        role: RoleName.Mayor,
        actorId,
        recipientIds,
        isDrunk,
        text,
      });
    },
  },

  // 🌿 Outsiders
  {
    affiliation: Affiliation.Outsider,
    title: RoleName.Butler,
    picture: require('@/assets/roles/butler.png'),
    prompt: 'Choose someone to serve',
    doAction: singleTarget(RoleName.Butler, 'chose to serve'),
  },
  {
    affiliation: Affiliation.Outsider,
    title: RoleName.Recluse,
    picture: require('@/assets/roles/recluse.png'),
    prompt: '',
    doAction: ({ actorId, recipientIds = [], getName, isDrunk = false }): Action => {
      const actorName = getName(actorId);

      const targetId = recipientIds[0];
      const targetName = targetId ? getName(targetId) : 'someone';

      const text = `${actorName}: triggered ${targetName}`;

      return baseAction({
        role: RoleName.Recluse,
        actorId,
        recipientIds,
        isDrunk,
        text,
      });
    },
  },
  {
    affiliation: Affiliation.Outsider,
    title: RoleName.Saint,
    picture: require('@/assets/roles/saint.png'),
    prompt: '',
    doAction: ({ actorId, getName, isDrunk = false }): Action => {
      const actorName = getName(actorId);
      const text = `${actorName}: ended the game`;

      return baseAction({
        role: RoleName.Saint,
        actorId,
        isDrunk,
        text,
      });
    },
  },
  {
    affiliation: Affiliation.Outsider,
    title: RoleName.Drunk,
    picture: require('@/assets/roles/drunk.png'),
    prompt: '',
    doAction: ({ actorId, getName, isDrunk = true }): Action => {
      const actorName = getName(actorId);
      const text = `${actorName}: was drunk`;

      return baseAction({
        role: RoleName.Drunk,
        actorId,
        isDrunk, // likely always true here
        text,
      });
    },
  },

  // 🕷️ Minions
  {
    affiliation: Affiliation.Minion,
    title: RoleName.Poisoner,
    picture: require('@/assets/roles/poisoner.png'),
    prompt: 'Choose someone to poison',
    doAction: singleTarget(RoleName.Poisoner, 'poisoned'),
  },
  {
    affiliation: Affiliation.Minion,
    title: RoleName.Spy,
    picture: require('@/assets/roles/spy.png'),
    prompt: 'Heres your grimoire',
    doAction: ({ actorId, getName, isDrunk = false }): Action => {
      const actorName = getName(actorId);
      const text = `${actorName}: saw the grimoire`;

      return baseAction({
        role: RoleName.Spy,
        actorId,
        isDrunk,
        text,
      });
    },
  },
  {
    affiliation: Affiliation.Minion,
    title: RoleName.ScarletWoman,
    picture: require('@/assets/roles/scarlet_woman.png'),
    prompt: '',
    doAction: ({ actorId, getName, isDrunk = false }): Action => {
      const actorName = getName(actorId);
      const text = `${actorName}: acted`;

      return baseAction({
        role: RoleName.ScarletWoman,
        actorId,
        isDrunk,
        text,
      });
    },
  },
  {
    affiliation: Affiliation.Minion,
    title: RoleName.Baron,
    picture: require('@/assets/roles/baron.png'),
    prompt: '',
    doAction: ({ actorId, getName, isDrunk = false }): Action => {
      const actorName = getName(actorId);
      const text = `${actorName}: acted`;

      return baseAction({
        role: RoleName.Baron,
        actorId,
        isDrunk,
        text,
      });
    },
  },

  // 🔥 Demon
  {
    affiliation: Affiliation.Demon,
    title: RoleName.Imp,
    picture: require('@/assets/roles/imp.png'),
    prompt: 'Choose someone to kill',
    doAction: ({ actorId, recipientIds = [], getName, result, isDrunk = false }): Action => {
      const actorName = getName(actorId);

      const targetId = recipientIds[0];
      const targetName = targetId ? getName(targetId) : 'someone';

      const successText =
        typeof result === 'boolean'
          ? result
            ? `killed ${targetName}`
            : `failed to kill ${targetName}`
          : `attempted to kill ${targetName}`;

      const text = `${actorName}: ${successText}`;

      return baseAction({
        role: RoleName.Imp,
        actorId,
        recipientIds,
        result,
        isDrunk,
        text,
      });
    },
  },
];
