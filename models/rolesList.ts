import { Affiliation, Role, RoleName } from './role';

export const rolesList: Role[] = [
  // 🧑‍🌾 Townsfolk
  {
    affiliation: Affiliation.Townsfolk,
    title: RoleName.Washerwoman,
    picture: require('@/assets/roles/washerwoman.png'),
    prompt: 'Here is who is townsfolk',
  },
  {
    affiliation: Affiliation.Townsfolk,
    title: RoleName.Librarian,
    picture: require('@/assets/roles/librarian.png'),
    prompt: 'Heres the outsiders',
  },
  {
    affiliation: Affiliation.Townsfolk,
    title: RoleName.Investigator,
    picture: require('@/assets/roles/investigator.png'),
    prompt: 'Heres is a particular minion',
  },
  {
    affiliation: Affiliation.Townsfolk,
    title: RoleName.Chef,
    picture: require('@/assets/roles/chef.png'),
    prompt: 'here are the pairs',
  },
  {
    affiliation: Affiliation.Townsfolk,
    title: RoleName.Empath,
    picture: require('@/assets/roles/empath.png'),
    prompt: 'heres number of sus people',
  },
  {
    affiliation: Affiliation.Townsfolk,
    title: RoleName.FortuneTeller,
    picture: require('@/assets/roles/fortune_teller.png'),
    prompt: 'Choose 2 players to fortune tell',
  },
  {
    affiliation: Affiliation.Townsfolk,
    title: RoleName.Undertaker,
    picture: require('@/assets/roles/undertaker.png'),
    prompt: 'Heres the token of the player that was executed today',
  },
  {
    affiliation: Affiliation.Townsfolk,
    title: RoleName.Monk,
    picture: require('@/assets/roles/monk.png'),
    prompt: 'Choose someone to save',
  },
  {
    affiliation: Affiliation.Townsfolk,
    title: RoleName.Ravenkeeper,
    picture: require('@/assets/roles/ravenkeeper.png'),
    prompt: 'Choose a player to learn their identity',
  },
  {
    affiliation: Affiliation.Townsfolk,
    title: RoleName.Virgin,
    picture: require('@/assets/roles/virgin.png'),
    prompt: '',
  },
  {
    affiliation: Affiliation.Townsfolk,
    title: RoleName.Slayer,
    picture: require('@/assets/roles/slayer.png'),
    prompt: '',
  },
  {
    affiliation: Affiliation.Townsfolk,
    title: RoleName.Soldier,
    picture: require('@/assets/roles/soldier.png'),
    prompt: '',
  },
  {
    affiliation: Affiliation.Townsfolk,
    title: RoleName.Mayor,
    picture: require('@/assets/roles/mayor.png'),
    prompt: '',
  },

  // 🌿 Outsiders
  {
    affiliation: Affiliation.Outsider,
    title: RoleName.Butler,
    picture: require('@/assets/roles/butler.png'),
    prompt: 'Choose someone to serve',
  },
  {
    affiliation: Affiliation.Outsider,
    title: RoleName.Recluse,
    picture: require('@/assets/roles/recluse.png'),
    prompt: '',
  },
  {
    affiliation: Affiliation.Outsider,
    title: RoleName.Saint,
    picture: require('@/assets/roles/saint.png'),
    prompt: '',
  },
  {
    affiliation: Affiliation.Outsider,
    title: RoleName.Drunk,
    picture: require('@/assets/roles/drunk.png'),
    prompt: '',
  },

  // 🕷️ Minions
  {
    affiliation: Affiliation.Minion,
    title: RoleName.Poisoner,
    picture: require('@/assets/roles/poisoner.png'),
    prompt: 'Choose someone to poison',
  },
  {
    affiliation: Affiliation.Minion,
    title: RoleName.Spy,
    picture: require('@/assets/roles/spy.png'),
    prompt: 'Heres your grimoire',
  },
  {
    affiliation: Affiliation.Minion,
    title: RoleName.ScarletWoman,
    picture: require('@/assets/roles/scarlet_woman.png'),
    prompt: '',
  },
  {
    affiliation: Affiliation.Minion,
    title: RoleName.Baron,
    picture: require('@/assets/roles/baron.png'),
    prompt: '',
  },

  // 🔥 Demon
  {
    affiliation: Affiliation.Demon,
    title: RoleName.Imp,
    picture: require('@/assets/roles/imp.png'),
    prompt: 'Choose someone to kill',
  },
];
