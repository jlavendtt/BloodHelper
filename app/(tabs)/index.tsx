// app/(tabs)/index.tsx
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { useGameStore } from '@/stores/gameStore';
import { usePlayersStore } from '@/stores/playerStore';

export default function HomeScreen() {
  const { players } = usePlayersStore();

  const game = useGameStore((s) => s.game);
  const startNewGame = useGameStore((s) => s.startNewGame);
  const clearGame = useGameStore((s) => s.clearGame);

  const { roundId, actions } = useMemo(() => {
    if (!game) return { roundId: null as string | null, actions: [] as any[] };

    const rid = game.currentRoundId;
    const actionsByRole = game.roundsById[rid]?.actionsByRole ?? {};
    const list = Object.values(actionsByRole).filter(Boolean);

    list.sort((a, b) => String(a.type).localeCompare(String(b.type)));

    return { roundId: rid, actions: list };
  }, [game]);

  const canStart = players.length > 0;

  return (
    <ParallaxScrollView headerBackgroundColor={{ light: '#400000', dark: '#1a0000' }}>
      <View style={styles.wrap}>
        <ThemedText type="title">Game</ThemedText>

        <View style={styles.btnRow}>
          <Pressable
            disabled={!canStart}
            onPress={() => startNewGame(players)}
            style={[styles.btn, !canStart && styles.btnDisabled]}
          >
            <ThemedText type="defaultSemiBold">Start New Game</ThemedText>
            <ThemedText style={{ opacity: 0.85, fontSize: 12 }}>
              Uses current Players list ({players.length})
            </ThemedText>
          </Pressable>

          <Pressable
            disabled={!game}
            onPress={() => clearGame()}
            style={[styles.btn, styles.btnDanger, !game && styles.btnDisabled]}
          >
            <ThemedText type="defaultSemiBold">Clear Game</ThemedText>
            <ThemedText style={{ opacity: 0.85, fontSize: 12 }}>
              Removes rounds + actions
            </ThemedText>
          </Pressable>
        </View>

        {!game ? (
          <View style={styles.card}>
            <ThemedText type="subtitle">No game yet</ThemedText>
            <ThemedText style={{ opacity: 0.85 }}>
              Press “Start New Game” to begin recording actions.
            </ThemedText>
          </View>
        ) : (
          <>
            <ThemedText type="subtitle" style={{ opacity: 0.9 }}>
              Round {roundId} • Total actions: {actions.length}
            </ThemedText>

            <View style={styles.list}>
              {actions.length === 0 ? (
                <View style={styles.card}>
                  <ThemedText style={{ opacity: 0.85 }}>No actions recorded yet.</ThemedText>
                </View>
              ) : (
                actions.map((a) => (
                  <View key={String(a.type)} style={styles.card}>
                    <ThemedText type="defaultSemiBold">{String(a.type)}</ThemedText>
                    <ThemedText style={{ opacity: 0.9 }}>{a.text}</ThemedText>
                  </View>
                ))
              )}
            </View>
          </>
        )}
      </View>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 12, gap: 10 },
  btnRow: { flexDirection: 'row', gap: 10, marginTop: 6 },

  btn: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    padding: 12,
    gap: 4,
  },
  btnDanger: {
    backgroundColor: 'rgba(158,0,0,0.20)',
    borderColor: 'rgba(255,0,0,0.35)',
  },
  btnDisabled: { opacity: 0.35 },

  list: { gap: 10, marginTop: 6 },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    padding: 12,
    gap: 6,
  },
});
