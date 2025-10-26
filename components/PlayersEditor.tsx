import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { usePlayersStore } from '@/stores/playerStore';
import React, { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

export default function PlayersEditor() {
  const { players, addPlayer, removePlayer, renamePlayer, clearPlayers, seedIfEmpty } = usePlayersStore();
  const [name, setName] = useState('');

  return (
  <ThemedView style={{ gap: 10 }}>
    {/* input row stays the same */}
    <View style={{ gap: 8 }}>
      {players.map(item => (
        <View key={item.id} style={styles.playerRow}>
          <TextInput
            value={item.name}
            onChangeText={(t) => renamePlayer(item.id, t)}
            style={[styles.input, { flex: 1 }]}
          />
          <Pressable style={[styles.btn, styles.danger]} onPress={() => removePlayer(item.id)}>
            <ThemedText>Remove</ThemedText>
          </Pressable>
        </View>
      ))}
    </View>
  </ThemedView>
);
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  input: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    color: '#fff',
    minWidth: 120,
  },
  btn: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  ghost: { backgroundColor: 'rgba(255,255,255,0.03)' },
  warn: { backgroundColor: 'rgba(255,165,0,0.15)' },
  danger: { backgroundColor: 'rgba(158,0,0,0.25)' },
  playerRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
