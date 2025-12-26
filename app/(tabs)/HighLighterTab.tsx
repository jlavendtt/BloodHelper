// app/(tabs)/HighlighterTab.tsx
import PlayersCircleHighlighter from '@/components/PlayersCircleHighlighter';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import PromptsCarousel from '@/components/ui/PromptsCarousel';
import { usePlayersStore } from '@/stores/playerStore';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

const FIRST_PROMPTS = [
  'Who will you kill',
  'These are your minions,',
  'These is your demon,',
  'Who will you poison',
  'Here is your grimoire',
];

const OTHER_PROMPTS = [
  'Choose someone to poison',
  'Choose someone to save',
  'Heres grimoire',
  'Choose someone to kill',
  'Ravenkeeper',
  'Here is the token of the person who died today',
  'Empath',
  'Choose two players to fortune tell',
  'Butler choose a player',
];

type Mode = 'first' | 'other';

export default function HighlighterTab() {
  const { players } = usePlayersStore();
  const [mode, setMode] = useState<Mode>('first');

  const prompts = useMemo(
    () => (mode === 'first' ? FIRST_PROMPTS : OTHER_PROMPTS),
    [mode]
  );

  return (
    <ThemedView style={styles.screen}>
      {/* Top: prompts */}
      <View style={{ gap: 8 }}>
        <ThemedText type="subtitle">Story Prompts</ThemedText>
        {/* Key forces the carousel to reset to index 0 when list changes */}
        <PromptsCarousel
          key={mode}
          prompts={prompts}
          onIndexChange={(idx) => {
            // optional: react to prompt index changes
            // console.log('Prompt index:', idx, 'mode:', mode);
          }}
        />
      </View>

      {/* Middle: highlighter table */}
      <View style={{ gap: 8 }}>
        <PlayersCircleHighlighter
          players={players}
          onHighlightsChange={(ids) => {
            // handle highlighted player ids if needed
            // console.log('Highlighted player ids:', ids);
          }}
        />
      </View>

      {/* Bottom: mode buttons */}
      <View style={styles.bottomBar}>
        <Pressable
          onPress={() => setMode('first')}
          style={[styles.switchBtn, mode === 'first' ? styles.switchOn : styles.switchOff]}
          accessibilityRole="button"
          accessibilityLabel="Show first night prompts"
        >
          <ThemedText>First Night</ThemedText>
        </Pressable>

        <Pressable
          onPress={() => setMode('other')}
          style={[styles.switchBtn, mode === 'other' ? styles.switchOn : styles.switchOff]}
          accessibilityRole="button"
          accessibilityLabel="Show other nights prompts"
        >
          <ThemedText>Other Nights</ThemedText>
        </Pressable>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 12,
    gap: 12,
    justifyContent: 'space-between', // pushes the buttons to the bottom
  },
  bottomBar: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  switchBtn: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  switchOn: {
    backgroundColor: 'rgba(158,0,0,0.25)',
    borderColor: 'rgba(255,0,0,0.5)',
  },
  switchOff: {
    opacity: 0.9,
  },
});
