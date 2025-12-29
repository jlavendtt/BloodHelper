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

  const canStart = players.length > 0;

  // ✅ Build a list of rounds (sorted N1, N2, ...) each with its actions (sorted by role)
  const rounds = useMemo(() => {
    if (!game) return [];

    const entries = Object.values(game.roundsById);

    const sortedRounds = entries.sort((a, b) => {
      const aNum = Number(String(a.id).replace(/^N/, '')) || 0;
      const bNum = Number(String(b.id).replace(/^N/, '')) || 0;
      return aNum - bNum;
    });

    return sortedRounds.map((r) => {
      const list = Object.values(r.actionsByRole ?? {}).filter(Boolean) as any[];
      list.sort((a, b) => String(a.type).localeCompare(String(b.type)));
      return { id: r.id, actions: list };
    });
  }, [game]);

  const totalActions = useMemo(() => {
    return rounds.reduce((sum, r) => sum + r.actions.length, 0);
  }, [rounds]);

  return (
    <ParallaxScrollView headerBackgroundColor={{ light: '#400000', dark: '#1a0000' }}>
      <View style={styles.wrap}>
        <ThemedText type="title">Game</ThemedText>

        <View style={styles.btnRow}>
          <Pressable
            style={({ pressed }) => [
              styles.btn,
              !canStart && styles.btnDisabled,
              pressed && canStart && styles.btnPressed,
            ]}
            disabled={!canStart}
            onPress={() => startNewGame(players)}
          >
            <ThemedText type="defaultSemiBold">Start New Game</ThemedText>
            <ThemedText style={{ opacity: 0.85, fontSize: 12 }}>
              Uses current Players list ({players.length})
            </ThemedText>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.btn,
              styles.btnDanger,
              !game && styles.btnDisabled,
              pressed && game && styles.btnPressed,
            ]}
            disabled={!game}
            onPress={clearGame}
          >
            <ThemedText type="defaultSemiBold">Clear Game</ThemedText>
            <ThemedText style={{ opacity: 0.85, fontSize: 12 }}>Removes rounds + actions</ThemedText>
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
              Current round: {game.currentRoundId} • Total actions: {totalActions}
            </ThemedText>

            <View style={styles.list}>
              {rounds.length === 0 ? (
                <View style={styles.card}>
                  <ThemedText style={{ opacity: 0.85 }}>No rounds yet.</ThemedText>
                </View>
              ) : (
                rounds.map((r) => (
                  <View key={r.id} style={styles.roundBlock}>
                    <View style={styles.roundHeader}>
                      <ThemedText type="defaultSemiBold">Round {r.id}</ThemedText>
                      <ThemedText style={{ opacity: 0.8, fontSize: 12 }}>
                        {r.actions.length} action{r.actions.length === 1 ? '' : 's'}
                      </ThemedText>
                    </View>

                    {r.actions.length === 0 ? (
                      <View style={styles.card}>
                        <ThemedText style={{ opacity: 0.85 }}>No actions recorded.</ThemedText>
                      </View>
                    ) : (
                      r.actions.map((a) => (
                        <View key={`${r.id}-${String(a.type)}`} style={styles.card}>
                          <ThemedText type="defaultSemiBold">{String(a.type)}</ThemedText>
                          <ThemedText style={{ opacity: 0.9 }}>{a.text}</ThemedText>
                        </View>
                      ))
                    )}
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
  btnPressed: { opacity: 0.85 },

  list: { gap: 14, marginTop: 6 },

  roundBlock: { gap: 10 },
  roundHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },

  card: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    padding: 12,
    gap: 6,
  },
});
