// models/rolesList.ts
import { ImageSourcePropType } from 'react-native';
import { Affiliation, svRoleName } from './sv_role';

export interface Action
{
  actorPlayerId: string; // (for now you're passing name; swap to id later)
  type: svRoleName;
  text: string;

  recipient?: string[];   // player ids or names (your choice, just be consistent)
  result?: boolean;       // success / yes-no reading etc.
  roleToken?: svRoleName;   // optional revealed/learned token
  number?: number;        // optional number result (Mathematician/chef/etc.)
  wasDrunk: boolean;
}

export interface Role
{
  affiliation: Affiliation;
  title: svRoleName;
  picture: ImageSourcePropType;
  prompt: string;

  // Added roleToken + number so roles can embed them into text when needed
  doAction: 
  (
    playerName: string,
    recipients?: string[],
    result?: boolean,
    isDrunk?: boolean,
    roleToken?: svRoleName,
    number?: number
  ) => Action;
}

function joinNames(names: string[] | undefined)
{
  if (!names || names.length === 0) return '';
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(', ')}, and ${names[names.length - 1]}`;
}

function drunkSuffix(isDrunk?: boolean)
{
  return isDrunk ? ' (Drunk)' : '';
}

function baseAction(args:{
  role: svRoleName;
  playerName: string;
  recipients?: string[];
  result?: boolean;
  isDrunk?: boolean;
  roleToken?: svRoleName;
  number?: number;
  text: string;
}): Action 
{
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

// --- Helper makers (so Washerwoman/Librarian/Snake_Charmer can share) ---
function infoPairWithToken(role: svRoleName) {
  return (
    playerName: string,
    recipients: string[] = [],
    _result?: boolean,
    isDrunk = false,
    roleToken?: svRoleName
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

function singleTarget(role: svRoleName, verb: string) {
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
  // Townsfolk
  {
    affiliation: Affiliation.Townsfolk,
    title: svRoleName.Clockmaker,
    picture: require('@/assets/roles/sv_roles/clockmaker.png'),
    prompt: 'Here is who is townsfolk',
    doAction: infoPairWithToken(svRoleName.Clockmaker),
  },
  {
    affiliation: Affiliation.Townsfolk,
    title: svRoleName.Dreamer,
    picture: require('@/assets/roles/sv_roles/dreamer.png'),
    prompt: 'Here is who is townsfolk',
    doAction: infoPairWithToken(svRoleName.Dreamer),
  },
  {
    affiliation: Affiliation.Townsfolk,
    title: svRoleName.Snake_Charmer,
    picture: require('@/assets/roles/sv_roles/snake_charmer.png'),
    prompt: 'Here is who is townsfolk',
    doAction: infoPairWithToken(svRoleName.Snake_Charmer),
  },
  {
    affiliation: Affiliation.Townsfolk,
    title: svRoleName.Mathematician,
    picture: require('@/assets/roles/sv_roles/mathematician.png'),
    prompt: 'Here is who is townsfolk',
    doAction: infoPairWithToken(svRoleName.Mathematician),
  },
  {
    affiliation: Affiliation.Townsfolk,
    title: svRoleName.Flowergirl,
    picture: require('@/assets/roles/sv_roles/flowergirl.png'),
    prompt: 'Here is who is townsfolk',
    doAction: infoPairWithToken(svRoleName.Flowergirl),
  },
  {
    affiliation: Affiliation.Townsfolk,
    title: svRoleName.Town_Crier,
    picture: require('@/assets/roles/sv_roles/town_crier.png'),
    prompt: 'Here is who is townsfolk',
    doAction: infoPairWithToken(svRoleName.Town_Crier),
  },
  {
    affiliation: Affiliation.Townsfolk,
    title: svRoleName.Oracle,
    picture: require('@/assets/roles/sv_roles/oracle.png'),
    prompt: 'Here is who is townsfolk',
    doAction: infoPairWithToken(svRoleName.Oracle),
  },
  {
    affiliation: Affiliation.Townsfolk,
    title: svRoleName.Savant,
    picture: require('@/assets/roles/sv_roles/savant.png'),
    prompt: 'Here is who is townsfolk',
    doAction: infoPairWithToken(svRoleName.Savant),
  },
  {
    affiliation: Affiliation.Townsfolk,
    title: svRoleName.Seamstress,
    picture: require('@/assets/roles/sv_roles/seamstress.png'),
    prompt: 'Here is who is townsfolk',
    doAction: infoPairWithToken(svRoleName.Seamstress),
  },
  {
    affiliation: Affiliation.Townsfolk,
    title: svRoleName.Philosopher,
    picture: require('@/assets/roles/sv_roles/philosopher.png'),
    prompt: 'Here is who is townsfolk',
    doAction: infoPairWithToken(svRoleName.Philosopher),
  },
  {
    affiliation: Affiliation.Townsfolk,
    title: svRoleName.Artist,
    picture: require('@/assets/roles/sv_roles/artist.png'),
    prompt: 'Here is who is townsfolk',
    doAction: infoPairWithToken(svRoleName.Artist),
  },
  {
    affiliation: Affiliation.Townsfolk,
    title: svRoleName.Juggler,
    picture: require('@/assets/roles/sv_roles/juggler.png'),
    prompt: 'Here is who is townsfolk',
    doAction: infoPairWithToken(svRoleName.Juggler),
  },
  {
    affiliation: Affiliation.Townsfolk,
    title: svRoleName.Sage,
    picture: require('@/assets/roles/sv_roles/sage.png'),
    prompt: 'Here is who is townsfolk',
    doAction: infoPairWithToken(svRoleName.Sage),
  },

  // Outsiders
  {
    affiliation: Affiliation.Outsider,
    title: svRoleName.Mutant,
    picture: require('@/assets/roles/sv_roles/mutant.png'),
    prompt: 'Here are the outsiders',
    doAction: infoPairWithToken(svRoleName.Mutant),
  },
  {
    affiliation: Affiliation.Outsider,
    title: svRoleName.Barber,
    picture: require('@/assets/roles/sv_roles/barber.png'),
    prompt: 'Here are the outsiders',
    doAction: infoPairWithToken(svRoleName.Barber),
  },
  {
    affiliation: Affiliation.Outsider,
    title: svRoleName.Sweetheart,
    picture: require('@/assets/roles/sv_roles/Sweetheart.png'),
    prompt: 'Here are the outsiders',
    doAction: infoPairWithToken(svRoleName.Sweetheart),
  },
  {
    affiliation: Affiliation.Outsider,
    title: svRoleName.Klutz,
    picture: require('@/assets/roles/sv_roles/klutz.png'),
    prompt: 'Here are the outsiders',
    doAction: infoPairWithToken(svRoleName.Klutz),
  },

  // 🕷️ Minions
  {
    affiliation: Affiliation.Minion,
    title: svRoleName.Witch,
    picture: require('@/assets/roles/sv_roles/witch.png'),
    prompt: 'Choose someone to poison',
    doAction: singleTarget(svRoleName.Witch, 'poisoned'),
  },
  {
    affiliation: Affiliation.Minion,
    title: svRoleName.Cerenovus,
    picture: require('@/assets/roles/sv_roles/cerenovus.png'),
    prompt: 'Heres your grimoire',
    doAction: (playerName, _recipients = [], _result, isDrunk = false): Action => {
      const text = `${playerName}: saw the grimoire`;
      return baseAction({
        role: svRoleName.Cerenovus,
        playerName,
        isDrunk,
        text,
      });
    },
  },
  {
    affiliation: Affiliation.Minion,
    title: svRoleName.Pit_Hag,
    picture: require('@/assets/roles/sv_roles/pit_hag'),
    prompt: '',
    doAction: (playerName, _recipients = [], _result, isDrunk = false): Action => {
      const text = `${playerName}: acted`;
      return baseAction({
        role: svRoleName.Pit_Hag,
        playerName,
        isDrunk,
        text,
      });
    },
  },
  {
    affiliation: Affiliation.Minion,
    title: svRoleName.Evil_Twin,
    picture: require('@/assets/roles/sv_roles/evil_twin.png'),
    prompt: '',
    doAction: (playerName, _recipients = [], _result, isDrunk = false): Action => {
      const text = `${playerName}: acted`;
      return baseAction({
        role: svRoleName.Evil_Twin,
        playerName,
        isDrunk,
        text,
      });
    },
  },
 
  // 🔥 Demon
  {
    affiliation: Affiliation.Demon,
    title: svRoleName.Fang_Gu,
    picture: require('@/assets/roles/sv_roles/fang_gu.png'),
    prompt: 'Choose someone to kill',
    doAction: infoPairWithToken(svRoleName.Fang_Gu),
  },
  {
    affiliation: Affiliation.Demon,
    title: svRoleName.Vigormortus,
    picture: require('@/assets/roles/sv_roles/vigormortus.png'),
    prompt: 'Choose someone to kill',
    doAction: infoPairWithToken(svRoleName.Vigormortus),
  },
  {
    affiliation: Affiliation.Demon,
    title: svRoleName.No_Dashii,
    picture: require('@/assets/roles/sv_roles/no_dashii.png'),
    prompt: 'Choose someone to kill',
    doAction: infoPairWithToken(svRoleName.No_Dashii),
  },
  {
    affiliation: Affiliation.Demon,
    title: svRoleName.Vortox,
    picture: require('@/assets/roles/sv_roles/vortox.png'),
    prompt: 'Choose someone to kill',
    doAction: infoPairWithToken(svRoleName.Vortox),
  },
];