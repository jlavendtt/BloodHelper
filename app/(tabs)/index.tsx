import { Image } from 'expo-image';
import { StyleSheet } from 'react-native';

import { HelloWave } from '@/components/hello-wave';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Link } from 'expo-router';

export default function HomeScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#400000', dark: '#1a0000' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Blood on the Clocktower Helper</ThemedText>
        <HelloWave />
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Track the Game</ThemedText>
        <ThemedText>
          Use this app to keep track of roles, bluffs, and night order without flipping through a script book. Perfect for storytellers and players alike.
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <Link href="/roles">
          <Link.Trigger>
            <ThemedText type="subtitle">Open Roles Ledger</ThemedText>
          </Link.Trigger>
        </Link>
        <ThemedText>
          Quickly view and manage townsfolk, outsiders, minions, and demons.
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <Link href="/night-order">
          <Link.Trigger>
            <ThemedText type="subtitle">Open Night Order</ThemedText>
          </Link.Trigger>
        </Link>
        <ThemedText>
          Reference ability timing in a clean, fast list.
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <Link href="/grimoire">
          <Link.Trigger>
            <ThemedText type="subtitle">Open Grimoire</ThemedText>
          </Link.Trigger>
        </Link>
        <ThemedText>
          Manage tokens, reminders, and game state visually.
        </ThemedText>
      </ThemedView>
        <ThemedView style={styles.stepContainer}>
        <Link href="/table">
          <Link.Trigger>
            <ThemedText type="subtitle">Open Table</ThemedText>
          </Link.Trigger>
        </Link>
        <ThemedText>
          Look at a table. Amazing
        </ThemedText>
      </ThemedView>
      
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
