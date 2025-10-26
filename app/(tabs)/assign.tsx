// app/assign.tsx
import PlayersBoard from '@/components/PlayersBoard';
import PlayersEditor from '@/components/PlayersEditor';
import RoleGrid from '@/components/RoleGrid';
import { ThemedText } from '@/components/themed-text';
import { RoleName } from '@/models/role';
import { usePlayersStore } from '@/stores/playerStore';
import { useRoleStore } from '@/stores/roleStore';
import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AssignScreen() {
  const [selectedRole, setSelectedRole] = useState<RoleName | undefined>(undefined);
  const assignRole = useRoleStore((s) => s.assignRole);
  const assigned = useRoleStore((s) => s.assigned);

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

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 }}>
        {/* Pinned header text (non-scrolling) */}
        <ThemedText type="title">Assign Roles</ThemedText>
        <ThemedText style={{ opacity: 0.8, marginBottom: 6 }}>
          Tap a role, then tap a player's name. Each role is unique.
        </ThemedText>

        {/* 🔝 Roles grid pinned at the top; it scrolls inside its own area */}
        <ThemedText type="subtitle">Roles ({assignedCount} assigned)</ThemedText>
        <RoleGrid selectedRole={selectedRole} onSelect={onPickRole} containerHeight={260} />

        {/* 👇 Players area gets the remaining space and can scroll independently */}
        <ThemedText type="subtitle" style={{ marginTop: 8 }}>Players</ThemedText>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 16 }}>
          <PlayersBoard
            players={players}
            onPressPlayer={handleAssignToPlayer}
            highlightWhenReady={!!selectedRole}
          />

          {/* Optional: editor at bottom of the players area */}
          <ThemedText type="subtitle" style={{ marginTop: 12 }}>
            Manage Players
          </ThemedText>
          <PlayersEditor />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
