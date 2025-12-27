import { RoleName } from './role';

export interface Action {
  actorPlayerId: string;   // who performed the action

  type: RoleName;          // role that produced this action
  text: string;            // human-readable description

  recipient?: string[];    // playerIds affected (0, 1, or many)
  result?: boolean;        // yes/no result (fortune teller, empath, etc.)
  number?: number
  wasDrunk: boolean;       // defaults to false
  roleToken?: RoleName
}