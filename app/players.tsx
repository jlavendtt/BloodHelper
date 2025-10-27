// app/(tabs)/players.tsx
import PlayersEditor from '@/components/PlayersEditor';
import { ThemedText } from '@/components/themed-text';
import React from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PlayersTab() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={{ gap: 12 }}>
          <ThemedText type="title">Players</ThemedText>
          <ThemedText style={{ opacity: 0.8 }}>
            Add, remove, or rename players. Changes are saved automatically.
          </ThemedText>

          <PlayersEditor />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
