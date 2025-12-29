import { ImageSourcePropType } from 'react-native';

export enum Affiliation
{
  Townsfolk = 'Townsfolk',
  Outsider = 'Outsider',
  Minion = 'Minion',
  Demon = 'Demon',
}

/**
 * All roles in the Sects and Violence script.
 */
export enum svRoleName 
{
  // Townsfolk
  Clockmaker = 'Clockmaker',
  Dreamer = 'Dreamer',
  Snake_Charmer = 'Snake Charmer',
  Mathematician = 'Mathematician',
  Flowergirl = 'Flowergirl',
  Town_Crier = 'Town Crier',
  Oracle = 'Oracle',
  Savant = 'Savant',
  Seamstress = 'Seamstress',
  Philosopher = 'Philosopher',
  Artist = 'Artist',
  Juggler = 'Juggler',
  Sage = 'Sage',

  // Outsiders
  Mutant = 'Mutant',
  Barber = 'Barber',
  Sweetheart = 'Sweetheart',
  Klutz = 'Klutz',

  // Minions
  Witch = 'Witch',
  Cerenovus = 'Cerenovus',
  Pit_Hag = 'Pit Hag',
  Evil_Twin = 'Evil Twin',

  // Demon
  Fang_Gu = 'Fang_Gu',
  Vigormortus = 'Vigormortus',
  No_Dashii = 'No Dashii',
  Vortox = 'Vortox'
}

/**
 * Core role model
 */
export interface Role
{
  affiliation: Affiliation;
  title: svRoleName;
  picture: ImageSourcePropType;
  prompt: string
}
