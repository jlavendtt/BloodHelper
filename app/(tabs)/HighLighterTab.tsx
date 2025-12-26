// app/(tabs)/HighlighterTab.tsx
import PlayersCircleTable from '@/components/PlayersCircleTable';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { RoleName } from '@/models/role';
import { rolesList } from '@/models/rolesList';
import { usePlayersStore } from '@/stores/playerStore';
import { useRoleStore } from '@/stores/roleStore';
import { Image } from 'expo-image';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

type Mode = 'first' | 'other';

const FIRST_NIGHT_ROLES: RoleName[] = [
  RoleName.Poisoner,
  RoleName.Spy,
  RoleName.Washerwoman,
  RoleName.Librarian,
  RoleName.Investigator,
  RoleName.Chef,
  RoleName.Empath,
  RoleName.FortuneTeller,
  RoleName.Butler,
];

const OTHER_NIGHTS_ROLES: RoleName[] = [
  RoleName.Poisoner,
  RoleName.Monk,
  RoleName.Spy,
  RoleName.Imp,
  RoleName.Ravenkeeper,
  RoleName.Undertaker,
  RoleName.Empath,
  RoleName.FortuneTeller,
  RoleName.Butler,
];

export default function HighlighterTab() {
  const { players } = usePlayersStore();
  const assigned = useRoleStore((s) => s.assigned) as Record<string, RoleName | undefined>;

  const [mode, setMode] = useState<Mode>('first');
  const [selectedRole, setSelectedRole] = useState<RoleName | null>(null);

  const roleOrder = useMemo(
    () => (mode === 'first' ? FIRST_NIGHT_ROLES : OTHER_NIGHTS_ROLES),
    [mode]
  );

  const roleByName = useMemo(() => {
    const map = new Map<RoleName, (typeof rolesList)[number]>();
    for (const r of rolesList) map.set(r.title, r);
    return map;
  }, []);

  const playerIdForRole = useMemo(() => {
    const map = new Map<RoleName, string>();
    for (const [playerId, role] of Object.entries(assigned ?? {})) {
      if (role) map.set(role, playerId);
    }
    return map;
  }, [assigned]);

  const rolesInThisMode = useMemo(
    () =>
      roleOrder
        .map((r) => roleByName.get(r))
        .filter(Boolean) as (typeof rolesList)[number][],
    [roleOrder, roleByName]
  );

  const firstClickableRole = useMemo(() => {
    return rolesInThisMode.find((r) => playerIdForRole.get(r.title))?.title ?? null;
  }, [rolesInThisMode, playerIdForRole]);

  useEffect(() => {
    setSelectedRole(firstClickableRole);
  }, [mode, firstClickableRole]);

  useEffect(() => {
    if (selectedRole && !playerIdForRole.get(selectedRole)) {
      setSelectedRole(firstClickableRole);
    }
  }, [selectedRole, playerIdForRole, firstClickableRole]);

  const selectedRoleObj = selectedRole ? roleByName.get(selectedRole) : undefined;
  const selectedPrompt =
    selectedRoleObj?.prompt?.trim() || 'No prompt.';
  const focusPlayerId = selectedRole
    ? playerIdForRole.get(selectedRole)
    : undefined;

  // split into two rows
  const mid = Math.ceil(rolesInThisMode.length / 2);
  const row1 = rolesInThisMode.slice(0, mid);
  const row2 = rolesInThisMode.slice(mid);

  const renderRow = (row: typeof rolesInThisMode) => (
    <View style={styles.roleRow}>
      {row.map((r) => {
        const isSelected = r.title === selectedRole;
        const hasPlayer = Boolean(playerIdForRole.get(r.title));

        return (
          <Pressable
            key={String(r.title)}
            disabled={!hasPlayer}
            onPress={() => hasPlayer && setSelectedRole(r.title)}
            style={[
              styles.roleChip,
              isSelected && styles.roleChipOn,
              !hasPlayer && styles.roleChipDisabled,
            ]}
          >
            <Image source={r.picture} style={styles.roleIcon} contentFit="contain" />
          </Pressable>
        );
      })}
    </View>
  );

  return (
    <ThemedView style={styles.screen}>
      {/* Top: roles (2 rows) */}
      <View style={styles.top}>
        <ThemedText type="subtitle">
          {mode === 'first' ? 'First Night Roles' : 'Other Nights Roles'}
        </ThemedText>

        {renderRow(row1)}
        {row2.length > 0 && renderRow(row2)}

        {/* Prompt row */}
        <View style={styles.promptBox}>
          <ThemedText type="defaultSemiBold">
            {selectedRoleObj?.title ?? 'No assigned role'} {selectedRoleObj ? selectedPrompt : ''}
          </ThemedText>
        </View>
      </View>

      {/* Middle */}
      <View style={styles.middle}>
        <PlayersCircleTable
          players={players}
          mode="highlight"
          radius={150}
          focusPlayerId={focusPlayerId}
        />
      </View>

      {/* Bottom */}
      <View style={styles.bottomBar}>
        <Pressable
          onPress={() => setMode('first')}
          style={[styles.switchBtn, mode === 'first' && styles.switchOn]}
        >
          <ThemedText>First Night</ThemedText>
        </Pressable>

        <Pressable
          onPress={() => setMode('other')}
          style={[styles.switchBtn, mode === 'other' && styles.switchOn]}
        >
          <ThemedText>Other Nights</ThemedText>
        </Pressable>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 12,
    gap: 12,
  },
  top: {
    gap: 8,
  },
  middle: {
    flex: 1,
    justifyContent: 'center',
  },

  roleRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },

  roleChip: {
    width: 52,
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleChipOn: {
    backgroundColor: 'rgba(158,0,0,0.25)',
    borderColor: 'rgba(255,0,0,0.5)',
  },
  roleChipDisabled: {
    opacity: 0.25,
  },
  roleIcon: {
    width: 38,
    height: 38,
  },

  promptBox: {
    marginTop: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    gap: 4,
    marginBottom: 150
    // your marginBottom: 150 can stay here
  },

  bottomBar: {
    flexDirection: 'row',
    gap: 10,
  },
  switchBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  switchOn: {
    backgroundColor: 'rgba(158,0,0,0.25)',
    borderColor: 'rgba(255,0,0,0.5)',
  },
});
