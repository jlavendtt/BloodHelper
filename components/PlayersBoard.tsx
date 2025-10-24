
// components/PlayersBoard.tsx — tap a player to assign the currently selected role
import { ThemedText } from '@/components/themed-text';
import { useRoleStore } from '@/stores/roleStore';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

export type Player = { id: string; name: string };

interface PlayersBoardProps {
  players: Player[];
  onPressPlayer: (playerId: string) => void;
  highlightWhenReady?: boolean; // highlights players when a role is selected
}

export default function PlayersBoard({ players, onPressPlayer, highlightWhenReady }: PlayersBoardProps) {
  const assigned = useRoleStore(s => s.assigned);

  return (
    <View style={styles.grid}>
      {players.map(p => {
        const role = assigned[p.id];
        return (
          <Pressable
            key={p.id}
            onPress={() => onPressPlayer(p.id)}
            style={({ pressed }) => [
              styles.tile,
              highlightWhenReady && styles.tileReady,
              role && styles.tileHasRole,
              pressed && { opacity: 0.9 },
            ]}
          >
            <ThemedText type="defaultSemiBold">{p.name}</ThemedText>
            <ThemedText style={{ opacity: 0.8, marginTop: 4 }}>
              {role ?? '— unassigned —'}
            </ThemedText>
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
    gap: 10,
  },
  tile: {
    flexBasis: '48%',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(0,0,0,0.2)'
  },
  tileReady: {
    borderColor: 'rgba(255,0,0,0.6)'
  },
  tileHasRole: {
    backgroundColor: 'rgba(0,128,0,0.12)'
  }
});

