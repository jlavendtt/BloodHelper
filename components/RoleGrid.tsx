// components/RoleGrid.tsx
import { Affiliation, RoleName } from '@/models/role';
import { rolesList } from '@/models/rolesList';
import { usePlayersStore } from '@/stores/playerStore';
import { useRoleStore } from '@/stores/roleStore';
import { getOccupiedRoles, getRoleStatus } from '@/utils/roleDistribution';
import { Image } from 'expo-image';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

export type RoleGridProps = {
  selectedRole?: RoleName;
  onSelect: (role?: RoleName) => void;
  affiliations?: Affiliation[];

  // Optional override if you still want to pass it from the screen.
  // If omitted, RoleGrid computes it from the store.
  occupiedRoles?: Set<RoleName>;
};

export default function RoleGrid({
  selectedRole,
  onSelect,
  affiliations,
  occupiedRoles: occupiedRolesProp,
}: RoleGridProps) {
  const assigned = useRoleStore((s) => s.assigned);
  const players = usePlayersStore((s) => s.players);

  // (Helper available for your UI elsewhere if you want it.)
  // Example usage: status.townsfolk.delta etc.
  const status = useMemo(() => getRoleStatus(players.length, assigned), [players.length, assigned]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _statusForLater = status;

  const occupiedRoles = useMemo(() => {
    return occupiedRolesProp ?? getOccupiedRoles(assigned);
  }, [occupiedRolesProp, assigned]);

  const filtered = useMemo(() => {
    return affiliations?.length
      ? rolesList.filter((r) => affiliations.includes(r.affiliation))
      : rolesList;
  }, [affiliations]);

  return (
    <View style={styles.grid}>
      {filtered.map((item) => {
        const roleName = item.title as RoleName;
        const isSelected = selectedRole === roleName;
        const isOccupied = occupiedRoles.has(roleName);

        return (
          <Pressable
            key={String(roleName)}
            onPress={() => onSelect(isSelected ? undefined : roleName)}
            style={({ pressed }) => [
              styles.card,
              isOccupied && styles.cardOccupied, // 🟢 occupied => green background
              isSelected && styles.cardSelected,
              pressed && { opacity: 0.9 },
            ]}
          >
            <Image source={item.picture} style={styles.avatar} contentFit="cover" />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    paddingHorizontal: 0,
    rowGap: 4,
    columnGap: 4,
    flexShrink: 0,
    height: 222,
  },
  card: {
    width: '18.5%',
    minHeight: 60,
    paddingVertical: 2,
    paddingHorizontal: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(0,0,0,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // 🟢 occupied role background
  cardOccupied: {
    backgroundColor: 'rgba(0, 180, 0, 0.35)',
    borderColor: 'rgba(0, 220, 0, 0.8)',
  },

  // Selected stays red (your existing behavior)
  cardSelected: {
    borderColor: 'rgba(255,0,0,0.8)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },

  avatar: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
});
