// components/PlayersTable.tsx
import { ThemedText } from '@/components/themed-text';
import { useRoleStore } from '@/stores/roleStore';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

export type Player = { id: string; name: string };

export default function PlayersTable({
  players,
  onPressPlayer,
  highlightWhenReady,
}: {
  players: Player[];
  onPressPlayer: (playerId: string) => void;
  highlightWhenReady?: boolean;
}) {
  const assigned = useRoleStore(s => s.assigned);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.row, styles.header]}>
        <ThemedText type="defaultSemiBold" style={[styles.cell, styles.nameCol]}>Player</ThemedText>
        <ThemedText type="defaultSemiBold" style={[styles.cell, styles.roleCol]}>Role</ThemedText>
      </View>

      {/* Body (scrollable if long) */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 8 }}>
        {players.map(p => {
          const role = assigned[p.id];
          return (
            <Pressable
              key={p.id}
              onPress={() => onPressPlayer(p.id)}
              style={({ pressed }) => [
                styles.row,
                highlightWhenReady && styles.rowReady,
                pressed && { opacity: 0.85 },
              ]}
            >
              <ThemedText style={[styles.cell, styles.nameCol]} numberOfLines={1}>
                {p.name}
              </ThemedText>
              <ThemedText style={[styles.cell, styles.roleCol, !role && styles.unassigned]} numberOfLines={1}>
                {role ?? '—'}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const ROW_H = 44;

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(0,0,0,0.18)',
    overflow: 'hidden',
    height: 280, // fixed table height so layout is stable
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    height: ROW_H,                     // fixed row height
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  header: {
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  rowReady: {
    borderLeftWidth: 3,
    borderLeftColor: 'rgba(255,0,0,0.7)',
  },
  cell: {
    paddingHorizontal: 12,
  },
  nameCol: {
    flex: 1,
  },
  roleCol: {
    width: 140,
    textAlign: 'right',
  },
  unassigned: {
    opacity: 0.6,
  },
});
