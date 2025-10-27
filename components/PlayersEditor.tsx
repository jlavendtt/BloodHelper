import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { usePlayersStore } from '@/stores/playerStore';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

export default function PlayersEditor() {
  const {
    players,
    nameHistory,                 // ⬅️ pull raw history so memo updates
    addPlayer,
    addFromHistory,
    removePlayer,
    renamePlayer,
    clearPlayers,
    removeFromHistory,
  } = usePlayersStore();

  const [name, setName] = useState('');
  const [removeMode, setRemoveMode] = useState(false);

  const norm = (s: string) => s.trim().toLowerCase();
  // Show history entries NOT already in the game; sort A→Z
  const previousSorted = useMemo(() => {
    const current = new Set(players.map(p => norm(p.name)));
    return nameHistory
      .filter(n => !current.has(norm(n)))
      .slice()
      .sort((a, b) => a.localeCompare(b));
  }, [nameHistory, players]);

  const handleAdd = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    addPlayer(trimmed);
    setName('');
  };

  const handleChipPress = (n: string) => {
    if (removeMode) {
      removeFromHistory(n);    // ⬅️ now immediately reflected thanks to fixed memo deps
    } else {
      addFromHistory(n);
    }
  };

  return (
    <ThemedView style={{ gap: 12 }}>
      {/* Add new player */}
      <ThemedText type="subtitle">Add Player</ThemedText>
      <View style={styles.row}>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Player name"
          placeholderTextColor="#999"
          style={styles.input}
          returnKeyType="done"
          onSubmitEditing={handleAdd}
        />
        <Pressable style={styles.btn} onPress={handleAdd}>
          <ThemedText>Add</ThemedText>
        </Pressable>
        <Pressable style={[styles.btn, styles.warn]} onPress={clearPlayers}>
          <ThemedText>Clear All</ThemedText>
        </Pressable>
      </View>

      {/* Current players */}
      <ThemedText type="subtitle">In Game</ThemedText>
      <View style={{ gap: 8 }}>
        {players.map((p) => (
          <View key={p.id} style={styles.playerRow}>
            <TextInput
              value={p.name}
              onChangeText={(t) => renamePlayer(p.id, t)}
              style={[styles.input, { flex: 1 }]}
            />
            <Pressable style={[styles.btn, styles.danger]} onPress={() => removePlayer(p.id)}>
              <ThemedText>Remove</ThemedText>
            </Pressable>
          </View>
        ))}
        {players.length === 0 && (
          <ThemedText style={{ opacity: 0.7 }}>
            No players yet. Add one above or pick from previously used.
          </ThemedText>
        )}
      </View>

      {/* Previously used — 3 columns, no internal scroll */}
      <ThemedText type="subtitle">Previously used</ThemedText>
      <View style={styles.chipsGrid}>
        {previousSorted.length === 0 ? (
          <ThemedText style={{ opacity: 0.7 }}>No previous names yet.</ThemedText>
        ) : (
          previousSorted.map((n, i) => {
            const isThird = i % 3 === 2;
            return (
              <Pressable
                key={n}
                onPress={() => handleChipPress(n)}
                style={[
                  styles.historyChip,
                  !isThird && styles.historyChipRight,
                  removeMode && styles.historyChipRemoveMode,
                ]}
              >
                <Text style={styles.chipText} numberOfLines={1}>{n}</Text>
              </Pressable>
            );
          })
        )}
      </View>

      {/* Remove User toggle — moved to the VERY BOTTOM */}
      <Pressable
  style={[
    styles.btn,
    styles.removeToggle,
    removeMode ? styles.removeOn : styles.removeOff,
  ]}
  onPress={() => setRemoveMode(v => !v)}
>
  <ThemedText>{removeMode ? 'Remove User: ON' : 'Remove User'}</ThemedText>
</Pressable>
    </ThemedView>
  );
}

const COL_GAP = 8;

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  input: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    color: '#fff',
    minWidth: 120,
  },
  removeToggle: {
  alignSelf: 'center',  // ⬅️ centers the button horizontally
},
  btn: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignSelf: 'flex-start',
  },
  // remove toggle states
  removeOn: {
    backgroundColor: 'rgba(158,0,0,0.25)',
    borderColor: 'rgba(255,0,0,0.35)',
  },
  removeOff: {
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  warn: { backgroundColor: 'rgba(255,165,0,0.15)' },
  danger: { backgroundColor: 'rgba(158,0,0,0.25)' },
  playerRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },

  chipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  historyChip: {
    width: '31%',       // exactly 3 columns
    marginBottom: COL_GAP,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  historyChipRight: { marginRight: COL_GAP },
  historyChipRemoveMode: {
    backgroundColor: 'rgba(158,0,0,0.15)',
    borderColor: 'rgba(255,0,0,0.35)',
  },
  chipText: { color: '#fff' },
});
