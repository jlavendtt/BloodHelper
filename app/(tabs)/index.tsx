// app/(tabs)/index.tsx
import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { useGameStore } from '@/stores/gameStore';

export default function HomeScreen() {
  const game = useGameStore((s) => s.game);

  const { roundId, actions } = useMemo(() => {
    if (!game) return { roundId: null as string | null, actions: [] as any[] };

    const rid = game.currentRoundId;
    const actionsByRole = game.roundsById[rid]?.actionsByRole ?? {};
    const list = Object.values(actionsByRole).filter(Boolean);

    // optional: sort by role name
    list.sort((a, b) => String(a.type).localeCompare(String(b.type)));

    return { roundId: rid, actions: list };
  }, [game]);

  return (
    <ParallaxScrollView headerBackgroundColor={{ light: '#400000', dark: '#1a0000' }}>
      <View style={styles.wrap}>
        {!game ? (
          <View style={styles.card}>
            <ThemedText type="subtitle">No game yet</ThemedText>
            <ThemedText style={{ opacity: 0.85 }}>
              Start a game from your setup screen (or wherever you create players).
            </ThemedText>
          </View>
        ) : (
          <>
            <ThemedText type="title">Round {roundId}</ThemedText>
            <ThemedText type="subtitle" style={{ opacity: 0.9 }}>
              Total actions: {actions.length}
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
