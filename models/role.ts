import { ImageSourcePropType } from 'react-native';

export enum Affiliation {
  Townsfolk = 'Townsfolk',
  Outsider = 'Outsider',
  Minion = 'Minion',
  Demon = 'Demon',
}

/**
 * All roles in the Trouble Brewing script.
 */
export enum RoleName {
  // Townsfolk
  Washerwoman = 'Washerwoman',
  Librarian = 'Librarian',
  Investigator = 'Investigator',
  Chef = 'Chef',
  Empath = 'Empath',
  FortuneTeller = 'Fortune Teller',
  Undertaker = 'Undertaker',
  Monk = 'Monk',
  Ravenkeeper = 'Ravenkeeper',
  Virgin = 'Virgin',
  Slayer = 'Slayer',
  Soldier = 'Soldier',
  Mayor = 'Mayor',

  // Outsiders
  Butler = 'Butler',
  Recluse = 'Recluse',
  Saint = 'Saint',
  Drunk = 'Drunk',

  // Minions
  Poisoner = 'Poisoner',
  Spy = 'Spy',
  ScarletWoman = 'Scarlet Woman',
  Baron = 'Baron',

  // Demon
  Imp = 'Imp',
}

/**
 * Core role model
 */
export interface Role {
  affiliation: Affiliation;
  title: RoleName;
  picture: ImageSourcePropType;
}
