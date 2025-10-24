


// app/assign.tsx — Storyteller assignment workflow (select a role → click a player)
import ParallaxScrollView from '@/components/parallax-scroll-view';
import PlayersBoard, { Player } from '@/components/PlayersBoard';
import RoleGrid from '@/components/RoleGrid';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { RoleName } from '@/models/role';
import { useRoleStore } from '@/stores/roleStore';
import React, { useMemo, useState } from 'react';
import { Alert, View } from 'react-native';

console.log('ASSIGN ROUTE RENDERED');

export default function AssignScreen() {
  // Example players — swap for your real player list or a players store
  const players: Player[] = [
    { id: 'p1', name: 'Alice' },
    { id: 'p2', name: 'Bob' },
    { id: 'p3', name: 'Charlie' },
    { id: 'p4', name: 'Daisy' },
    { id: 'p5', name: 'Eve' },
    { id: 'p6', name: 'Frank' },
    { id: 'p7', name: 'Grace' },
    { id: 'p8', name: 'Heidi' },
  ];

  const [selectedRole, setSelectedRole] = useState<RoleName | undefined>(undefined);
  const assignRole = useRoleStore(s => s.assignRole);
  const assigned = useRoleStore(s => s.assigned);

  const onPickRole = (role?: RoleName) => setSelectedRole(role);

  const handleAssignToPlayer = (playerId: string) => {
    if (!selectedRole) {
      Alert.alert('Select a role first', 'Tap a role, then tap a player to assign.');
      return;
    }
    assignRole(playerId, selectedRole);
    setSelectedRole(undefined); // optional: clear after assigning
  };

  const assignedCount = useMemo(() => Object.values(assigned).filter(Boolean).length, [assigned]);

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#400000', dark: '#1a0000' }}
      headerImage={<View />}
    >
      <ThemedView style={{ gap: 12 }}>
        <ThemedText type="title">Assign Roles</ThemedText>
        <ThemedText style={{ opacity: 0.8 }}>
          Tap a role below, then tap a player's name to give them that role. Each role can be assigned to exactly one player.
        </ThemedText>

        <ThemedText type="subtitle" style={{ marginTop: 8 }}>Roles ({assignedCount} assigned)</ThemedText>
        <RoleGrid selectedRole={selectedRole} onSelect={onPickRole} />

        <ThemedText type="subtitle" style={{ marginTop: 16 }}>Players</ThemedText>
        <PlayersBoard players={players} onPressPlayer={handleAssignToPlayer} highlightWhenReady={!!selectedRole} />
      </ThemedView>
    </ParallaxScrollView>
  );
}



