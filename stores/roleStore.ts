

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';


import { Affiliation, Role, RoleName } from '@/models/role';
import { rolesList } from '@/models/rolesList';


export type PlayerId = string;


interface RoleState {
    /** Map of playerId -> assigned RoleName (or undefined if unassigned) */
    assigned: Record<PlayerId, RoleName | undefined>;


    /** Assign a role uniquely to a player (removes it from anyone else). Pass undefined to clear */
    assignRole: (playerId: PlayerId, role: RoleName | undefined) => void;


    /** Remove a player's assignment */
    unassignRole: (playerId: PlayerId) => void;


    /** Clear all assignments */
    resetAssignments: () => void;


    /** Returns roles left given current assignments (optionally restrict by affiliation) */
    availableRoles: (affiliation?: Affiliation) => Role[];


    /** Returns roles left for a given player (keeps their current choice available) */
    availableForPlayer: (playerId: PlayerId, affiliation?: Affiliation) => Role[];
}


export const useRoleStore = create<RoleState>()(
    persist(
        (set, get) => ({
            assigned: {},


            assignRole: (playerId, role) =>
                set(state => {
                    const next: Record<PlayerId, RoleName | undefined> = { ...state.assigned };


                    // If assigning a specific role, ensure uniqueness: remove it from anyone else
                    if (role) {
                        for (const [pid, rn] of Object.entries(next)) {
                            if (rn === role) next[pid] = undefined;
                        }
                    }


                    next[playerId] = role;
                    return { assigned: next };
                }),


            unassignRole: playerId => set(state => {
                if (!(playerId in state.assigned)) return state;
                const next = { ...state.assigned };
                next[playerId] = undefined;
                return { assigned: next };
            }),


            resetAssignments: () => set({ assigned: {} }),


            availableRoles: (affiliation) => {
                const taken = new Set(Object.values(get().assigned).filter(Boolean) as RoleName[]);
                return rolesList.filter(r => {
                    if (affiliation && r.affiliation !== affiliation) return false;
                    return !taken.has(r.title);
                });
            },


            availableForPlayer: (playerId, affiliation) => {
                const current = get().assigned[playerId];
                const taken = new Set(
                    Object.entries(get().assigned)
                        .filter(([pid]) => pid !== playerId)
                        .map(([, rn]) => rn)
                        .filter(Boolean) as RoleName[]
                );
                return rolesList.filter(r => {
                    if (affiliation && r.affiliation !== affiliation) return false;
                    return r.title === current || !taken.has(r.title);
                });
            },
        }),
        {
            name: 'botc-role-store',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({ assigned: state.assigned }),
        }
    )
);