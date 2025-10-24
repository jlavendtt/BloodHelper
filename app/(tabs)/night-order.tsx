import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Image } from 'expo-image';
import { StyleSheet } from 'react-native';


export default function RolesScreen() {
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
<ThemedText type="title">Roles Ledger</ThemedText>
</ThemedView>


<ThemedView style={styles.stepContainer}>
<ThemedText type="subtitle">Track Roles</ThemedText>
<ThemedText>
View and manage townsfolk, outsiders, minions, and demons.
</ThemedText>
</ThemedView>


<ThemedView style={styles.stepContainer}>
<ThemedText type="subtitle">Coming Soon</ThemedText>
<ThemedText>
Interactive role management tools and filters.
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