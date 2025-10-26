// app/assign.tsx
import { Image } from 'expo-image';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import PlayersBoard from '@/components/PlayersBoard';
import RoleGrid from '@/components/RoleGrid';
import { ThemedText } from '@/components/themed-text';

import { Affiliation, RoleName } from '@/models/role';
import { usePlayersStore } from '@/stores/playerStore';
import { useRoleStore } from '@/stores/roleStore';

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
  useEffect(() => { seedIfEmpty(); }, []);

  const onPickRole = (role?: RoleName) => setSelectedRole(role);
  const handleAssignToPlayer = (playerId: string) => {
    if (!selectedRole) return;
    assignRole(playerId, selectedRole);
    setSelectedRole(undefined);
  };

  const assignedCount = useMemo(
    () => Object.values(assigned).filter(Boolean).length,
    [assigned]
  );

  const currentAffiliations = FILTER_TO_AFFILIATIONS[filter];

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 }}>
        {/* Filter bar (pinned, non-scroll) */}
        <View style={styles.filterRow}>
          <FilterBtn
            image={require('@/assets/affiliation/villager.png')}
            label="Villagers"
            active={filter === 'villager'}
            onPress={() => setFilter('villager')}
          />
          <FilterBtn
            image={require('@/assets/affiliation/outsider.png')}
            label="Outsiders"
            active={filter === 'outsider'}
            onPress={() => setFilter('outsider')}
          />
          <FilterBtn
            image={require('@/assets/affiliation/evil.png')}
            label="Evil"
            active={filter === 'evil'}
            onPress={() => setFilter('evil')}
          />
        </View>

        {/* Roles (NO SCROLL) — fixed-height area that shows *all* filtered roles */}
        <RoleGrid
          selectedRole={selectedRole}
          onSelect={onPickRole}
          affiliations={currentAffiliations}
          // no scroll; RoleGrid is a plain View
        />

        {/* Players below — this can scroll independently if it needs to */}
        <ThemedText type="subtitle" style={{ marginTop: 8 }}>Players</ThemedText>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 16 }}>
          <PlayersBoard
            players={players}
            onPressPlayer={handleAssignToPlayer}
            highlightWhenReady={!!selectedRole}
          />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

function FilterBtn({
  image, label, active, onPress,
}: { image: any; label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.filterBtn, active && styles.filterActive]}>
      <Image source={image} style={styles.filterImg} contentFit="cover" />
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
  filterImg: { width: 36, height: 36, borderRadius: 8 },
  filterLabel: { fontSize: 12, opacity: 0.85 },
});
