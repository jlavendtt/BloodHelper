import { Image } from 'expo-image';
import { StyleSheet } from 'react-native';


import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';


export default function GrimoireScreen() {
return (
<ParallaxScrollView
headerBackgroundColor={{ light: '#4b0000', dark: '#160000' }}
headerImage={
<Image
source={require('@/assets/images/partial-react-logo.png')}
style={styles.reactLogo}
/>
}>
<ThemedView style={styles.titleContainer}>
<ThemedText type="title">Grimoire</ThemedText>
</ThemedView>


<ThemedView style={styles.stepContainer}>
<ThemedText type="subtitle">Track the Game</ThemedText>
<ThemedText>
Manage tokens, reminders, and player states.
</ThemedText>
</ThemedView>


<ThemedView style={styles.stepContainer}>
<ThemedText type="subtitle">Coming Soon</ThemedText>
<ThemedText>
An interactive storyteller grimoire experience.
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