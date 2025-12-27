// app/assign.tsx
import { Image } from 'expo-image';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import RoleGrid from '@/components/RoleGrid';
import { ThemedText } from '@/components/themed-text';

import PlayersCircleTable from '@/components/PlayersCircleTable';
import { Affiliation, RoleName } from '@/models/role';
import { usePlayersStore } from '@/stores/playerStore';
import { useRoleStore } from '@/stores/roleStore';

// If you haven't set up "@/utils" alias yet, you can also import relatively:
// import { getRoleStatus } from '../utils/roleDistribution';
import { getRoleStatus } from '@/utils/roleDistribution';

type FilterKey = 'villager' | 'outsider' | 'evil';
const FILTER_TO_AFFILIATIONS: Record<FilterKey, Affiliation[]> = {
  villager: [Affiliation.Townsfolk],
  outsider: [Affiliation.Outsider],
  evil: [Affiliation.Minion, Affiliation.Demon],
};

export default function AssignScreen() {
  const [selectedRole, setSelectedRole] = useState<RoleName | undefined>(undefined);
  const [filter, setFilter] = useState<FilterKey>('villager');

  const assignRole = useRoleStore(s => s.assignRole);
  const assigned = useRoleStore(s => s.assigned);

  const { players, seedIfEmpty } = usePlayersStore();
  useEffect(() => {
    seedIfEmpty();
  }, []);

  // Roles that are already assigned to someone (occupied)
  const occupiedRoles = useMemo(() => {
    return new Set<RoleName>(Object.values(assigned).filter(Boolean) as RoleName[]);
  }, [assigned]);

  // ✅ Required vs actual vs delta for each faction
  const status = useMemo(() => {
    return getRoleStatus(players.length, assigned);
  }, [players.length, assigned]);

  const onPickRole = (role?: RoleName) => setSelectedRole(role);

  const handleAssignToPlayer = (playerId: string) => {
    if (!selectedRole) return;
    assignRole(playerId, selectedRole);
    setSelectedRole(undefined);
  };

  const currentAffiliations = FILTER_TO_AFFILIATIONS[filter];

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 }}>
        {/* Filter bar */}
        <View style={styles.filterRow}>
          <FilterBtn
            image={require('@/assets/affiliation/villager.png')}
            label="Villagers"
            active={filter === 'villager'}
            onPress={() => setFilter('villager')}
            // townsfolk row
            required={status.townsfolk.required}
            delta={status.townsfolk.delta}
            ok={status.townsfolk.ok}
          />
          <FilterBtn
            image={require('@/assets/affiliation/outsider.png')}
            label="Outsiders"
            active={filter === 'outsider'}
            onPress={() => setFilter('outsider')}
            required={status.outsiders.required}
            delta={status.outsiders.delta}
            ok={status.outsiders.ok}
          />
          <FilterBtn
            image={require('@/assets/affiliation/evil.png')}
            label="Evil"
            active={filter === 'evil'}
            onPress={() => setFilter('evil')}
            // For evil we show minions+demons as one combined requirement
            required={status.minions.required + status.demons.required}
            delta={status.minions.delta + status.demons.delta}
            ok={status.minions.ok && status.demons.ok}
          />
        </View>

        {/* Role icons (no text/badges, no scroll, 5 per row) */}
        <RoleGrid
          selectedRole={selectedRole}
          onSelect={onPickRole}
          affiliations={currentAffiliations}
          occupiedRoles={occupiedRoles} // green background for occupied roles (from RoleGrid)
        />

        {/* Table at the bottom */}
        <PlayersCircleTable
          players={players}
          selectedRole={selectedRole}
          onAssignRole = {handleAssignToPlayer}
          radius={150}
        />
      </View>
    </SafeAreaView>
  );
}

function FilterBtn({
  image,
  label,
  active,
  onPress,
  required,
  delta,
  ok,
}: {
  image: any;
  label: string;
  active: boolean;
  onPress: () => void;
  required: number;
  delta: number; // required - actual (positive => need more)
  ok: boolean;
}) {
  const deltaText =
    ok ? '✓' : delta > 0 ? `+${delta}` : `${delta}`; // negative already includes '-'

  return (
    <Pressable onPress={onPress} style={[styles.filterBtn, active && styles.filterActive]}>
      <View style={styles.filterTopRow}>
        <Image source={image} style={styles.filterImg} contentFit="cover" />

        {/* ✅ Number to the right of the icon */}
        <View style={styles.reqWrap}>
          <ThemedText style={styles.reqNumber}>{required}</ThemedText>
          <ThemedText
            style={[
              styles.deltaText,
              ok && styles.deltaOk,
              !ok && delta < 0 && styles.deltaOver, // blue for negative
              !ok && delta > 0 && styles.deltaNeed, // (optional) slightly brighter for +X
            ]}
          >
            {ok ? '✓' : deltaText}
          </ThemedText>
        </View>
      </View>

      <ThemedText style={styles.filterLabel}>{label}</ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  filterRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(0,0,0,0.2)',
    alignItems: 'center',
    gap: 6,
  },
  filterActive: { borderColor: 'rgba(255,0,0,0.8)' },

  filterTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  filterImg: { width: 36, height: 36, borderRadius: 8 },

  // number + delta to the right of the icon
  reqWrap: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    minWidth: 34,
  },
  reqNumber: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 16,
  },
  deltaText: {
    fontSize: 12,
    lineHeight: 14,
    opacity: 0.9,
  },
  deltaOk: {
    color: 'rgba(0, 220, 0, 0.95)', // green check
    fontWeight: '700',
  },
  deltaOver: {
    color: 'rgba(80, 160, 255, 0.95)', // blue for -X
    fontWeight: '700',
  },
  deltaNeed: {
    fontWeight: '700',
  },

  filterLabel: { fontSize: 12, opacity: 0.85 },
});
