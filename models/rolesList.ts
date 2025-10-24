import { Affiliation, Role, RoleName } from './role';

export const rolesList: Role[] = [
  // 🧑‍🌾 Townsfolk
  {
    affiliation: Affiliation.Townsfolk,
    title: RoleName.Washerwoman,
    picture: require('@/assets/roles/washerwoman.png'),
  },
  {
    affiliation: Affiliation.Townsfolk,
    title: RoleName.Librarian,
    picture: require('@/assets/roles/librarian.png'),
  },
  {
    affiliation: Affiliation.Townsfolk,
    title: RoleName.Investigator,
    picture: require('@/assets/roles/investigator.png'),
  },
  {
    affiliation: Affiliation.Townsfolk,
    title: RoleName.Chef,
    picture: require('@/assets/roles/chef.png'),
  },
  {
    affiliation: Affiliation.Townsfolk,
    title: RoleName.Empath,
    picture: require('@/assets/roles/empath.png'),
  },
  {
    affiliation: Affiliation.Townsfolk,
    title: RoleName.FortuneTeller,
    picture: require('@/assets/roles/fortune_teller.png'),
  },
  {
    affiliation: Affiliation.Townsfolk,
    title: RoleName.Undertaker,
    picture: require('@/assets/roles/undertaker.png'),
  },
  {
    affiliation: Affiliation.Townsfolk,
    title: RoleName.Monk,
    picture: require('@/assets/roles/monk.png'),
  },
  {
    affiliation: Affiliation.Townsfolk,
    title: RoleName.Ravenkeeper,
    picture: require('@/assets/roles/ravenkeeper.png'),
  },
  {
    affiliation: Affiliation.Townsfolk,
    title: RoleName.Virgin,
    picture: require('@/assets/roles/virgin.png'),
  },
  {
    affiliation: Affiliation.Townsfolk,
    title: RoleName.Slayer,
    picture: require('@/assets/roles/slayer.png'),
  },
  {
    affiliation: Affiliation.Townsfolk,
    title: RoleName.Soldier,
    picture: require('@/assets/roles/soldier.png'),
  },
  {
    affiliation: Affiliation.Townsfolk,
    title: RoleName.Mayor,
    picture: require('@/assets/roles/mayor.png'),
  },

  // 🌿 Outsiders
  {
    affiliation: Affiliation.Outsider,
    title: RoleName.Butler,
    picture: require('@/assets/roles/butler.png'),
  },
  {
    affiliation: Affiliation.Outsider,
    title: RoleName.Recluse,
    picture: require('@/assets/roles/recluse.png'),
  },
  {
    affiliation: Affiliation.Outsider,
    title: RoleName.Saint,
    picture: require('@/assets/roles/saint.png'),
  },
  {
    affiliation: Affiliation.Outsider,
    title: RoleName.Drunk,
    picture: require('@/assets/roles/drunk.png'),
  },

  // 🕷️ Minions
  {
    affiliation: Affiliation.Minion,
    title: RoleName.Poisoner,
    picture: require('@/assets/roles/poisoner.png'),
  },
  {
    affiliation: Affiliation.Minion,
    title: RoleName.Spy,
    picture: require('@/assets/roles/spy.png'),
  },
  {
    affiliation: Affiliation.Minion,
    title: RoleName.ScarletWoman,
    picture: require('@/assets/roles/scarlet_woman.png'),
  },
  {
    affiliation: Affiliation.Minion,
    title: RoleName.Baron,
    picture: require('@/assets/roles/baron.png'),
  },

  // 🔥 Demon
  {
    affiliation: Affiliation.Demon,
    title: RoleName.Imp,
    picture: require('@/assets/roles/imp.png'),
  },
];
