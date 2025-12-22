// app/(tabs)/TableTab.tsx
import PlayersCircleTable from '@/components/PlayersCircleTable';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { usePlayersStore } from '@/stores/playerStore';
import React from 'react';

export default function TableTab() {
  const { players } = usePlayersStore();

  return (
    <ThemedView style={{ flex: 1, padding: 12 }}>
      <ThemedText type="subtitle">
        Role Table
      </ThemedText>

      <PlayersCircleTable
        players={players}
        onPressPlayer={(id) => {
          console.log('Pressed player for role assignment:', id);
        }}
        showRing
        radius={150}
      />
    </ThemedView>
  );
}
