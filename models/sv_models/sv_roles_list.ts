// models/rolesList.ts
import { ImageSourcePropType } from 'react-native';
import { Affiliation, RoleName } from './role';

export interface Action {
  actorPlayerId: string; // (for now you're passing name; swap to id later)
  type: RoleName;
  text: string;

  recipient?: string[];   // player ids or names (your choice, just be consistent)
  result?: boolean;       // success / yes-no reading etc.
  roleToken?: RoleName;   // optional revealed/learned token
  number?: number;        // optional number result (empath/chef/etc.)
  wasDrunk: boolean;
}

export interface Role {
  affiliation: Affiliation;
  title: RoleName;
  picture: ImageSourcePropType;
  prompt: string;

  // Added roleToken + number so roles can embed them into text when needed
  doAction: (
    playerName: string,
    recipients?: string[],
    result?: boolean,
    isDrunk?: boolean,
    roleToken?: RoleName,
    number?: number
  ) => Action;
}

function joinNames(names: string[] | undefined) {
  if (!names || names.length === 0) return '';
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(', ')}, and ${names[names.length - 1]}`;
}

function drunkSuffix(isDrunk?: boolean) {
  return isDrunk ? ' (Drunk)' : '';
}

function baseAction(args: {
  role: RoleName;
  playerName: string;
  recipients?: string[];
  result?: boolean;
  isDrunk?: boolean;
  roleToken?: RoleName;
  number?: number;
  text: string;
}): Action {
  const { role, playerName, recipients, result, isDrunk = false, roleToken, number, text } = args;

  return {
    actorPlayerId: playerName, // swap to real id later
    type: role,
    text: `${text}${drunkSuffix(isDrunk)}`,
    recipient: recipients?.length ? recipients : undefined,
    result,
    roleToken,
    number,
    wasDrunk: isDrunk,
  };
}

// --- Helper makers (so Washerwoman/Librarian/Investigator can share) ---
function infoPairWithToken(role: RoleName) {
  return (
    playerName: string,
    recipients: string[] = [],
    _result?: boolean,
    isDrunk = false,
    roleToken?: RoleName
  ): Action => {
    const p1 = recipients[0];
    const p2 = recipients[1];
    const pair = joinNames([p1, p2].filter(Boolean) as string[]);
    const tokenText = roleToken ?? ('' as any);

    const text = `${playerName}: was shown that ${pair || 'two players'} and found one of them was ${String(
      tokenText || 'UNKNOWN'
    )}`;

    return baseAction({
      role,
      playerName,
      recipients,
      isDrunk,
      roleToken,
      text,
    });
  };
}

function singleTarget(role: RoleName, verb: string) {
  return (
    playerName: string,
    recipients: string[] = [],
    _result?: boolean,
    isDrunk = false
  ): Action => {
    const target = recipients[0] ?? 'someone';
    const text = `${playerName}: ${verb} ${target}`;
    return baseAction({ role, playerName, recipients, isDrunk, text });
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
    doAction: (playerName, _recipients = [], result, isDrunk = false, _roleToken, number): Action => {
      // result: true => there are pairs, false => no pairs (or use number if you prefer)
      const pairsText =
        typeof number === 'number'
          ? `${number} pair${number === 1 ? '' : 's'}`
          : typeof result === 'boolean'
            ? result
              ? 'pairs'
              : 'no pairs'
            : 'UNKNOWN';

      const text = `${playerName}: was alerted that there are ${pairsText}`;
      return baseAction({
        role: RoleName.Chef,
        playerName,
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
    doAction: (playerName, _recipients = [], _result, isDrunk = false, _roleToken, number): Action => {
      const nText = typeof number === 'number' ? String(number) : 'UNKNOWN';
      const text = `${playerName}: was alerted that there are ${nText} bad players next to them`;
      return baseAction({
        role: RoleName.Empath,
        playerName,
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
    doAction: (playerName, recipients = [], result, isDrunk = false): Action => {
      const p1 = recipients[0];
      const p2 = recipients[1];
      const pair = joinNames([p1, p2].filter(Boolean) as string[]);
      const resText =
        typeof result === 'boolean' ? (result ? 'YES' : 'NO') : 'UNKNOWN';
      const text = `${playerName}: chose ${pair || 'two players'} and got ${resText}`;
      return baseAction({
        role: RoleName.FortuneTeller,
        playerName,
        recipients,
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
    doAction: (playerName, recipients = [], _result, isDrunk = false, roleToken): Action => {
      const executed = recipients[0] ?? 'the executed player';
      const tokenText = roleToken ? String(roleToken) : 'UNKNOWN';
      const text = `${playerName}: was shown that ${executed} was ${tokenText}`;
      return baseAction({
        role: RoleName.Undertaker,
        playerName,
        recipients,
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
    doAction: (playerName, recipients = [], _result, isDrunk = false, roleToken): Action => {
      const target = recipients[0] ?? 'someone';
      const tokenText = roleToken ? String(roleToken) : 'UNKNOWN';
      const text = `${playerName}: learned that ${target}'s role was ${tokenText}`;
      return baseAction({
        role: RoleName.Ravenkeeper,
        playerName,
        recipients,
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
    doAction: (playerName, recipients = [], result, isDrunk = false): Action => {
      const target = recipients[0] ?? 'someone';
      const successText =
        typeof result === 'boolean'
          ? result
            ? `successfully killed ${target}`
            : `failed to kill ${target}`
          : `shot at ${target}`;
      const text = `${playerName}: ${successText}`;
      return baseAction({
        role: RoleName.Slayer,
        playerName,
        recipients,
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
    doAction: (playerName, recipients = [], _result, isDrunk = false): Action => {
      const attacker = recipients[0] ?? 'someone';
      const text = `${playerName}: defended themself against ${attacker}`;
      return baseAction({
        role: RoleName.Soldier,
        playerName,
        recipients,
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
    doAction: (playerName, recipients = [], _result, isDrunk = false): Action => {
      const attacker = recipients[0] ?? 'someone';
      const diedInstead = recipients[1] ?? 'someone else';
      const text = `${attacker} tried to kill ${playerName} (Mayor) and ${diedInstead} died in the process`;
      return baseAction({
        role: RoleName.Mayor,
        playerName,
        recipients,
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
    doAction: (playerName, recipients = [], _result, isDrunk = false): Action => {
      const target = recipients[0] ?? 'someone';
      const text = `${playerName}: triggered ${target}`;
      return baseAction({
        role: RoleName.Recluse,
        playerName,
        recipients,
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
    doAction: (playerName, _recipients = [], _result, isDrunk = false): Action => {
      const text = `${playerName}: ended the game`;
      return baseAction({
        role: RoleName.Saint,
        playerName,
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
    doAction: (playerName, _recipients = [], _result, isDrunk = true): Action => {
      const text = `${playerName}: was drunk`;
      return baseAction({
        role: RoleName.Drunk,
        playerName,
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
    doAction: (playerName, _recipients = [], _result, isDrunk = false): Action => {
      const text = `${playerName}: saw the grimoire`;
      return baseAction({
        role: RoleName.Spy,
        playerName,
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
    doAction: (playerName, _recipients = [], _result, isDrunk = false): Action => {
      const text = `${playerName}: acted`;
      return baseAction({
        role: RoleName.ScarletWoman,
        playerName,
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
    doAction: (playerName, _recipients = [], _result, isDrunk = false): Action => {
      const text = `${playerName}: acted`;
      return baseAction({
        role: RoleName.Baron,
        playerName,
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
    doAction: (playerName, recipients = [], result, isDrunk = false): Action => {
      const target = recipients[0] ?? 'someone';
      const successText =
        typeof result === 'boolean'
          ? result
            ? `killed ${target}`
            : `failed to kill ${target}`
          : `attempted to kill ${target}`;
      const text = `${playerName}: ${successText}`;
      return baseAction({
        role: RoleName.Imp,
        playerName,
        recipients,
        result,
        isDrunk,
        text,
      });
    },
  },
];
