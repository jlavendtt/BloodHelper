
import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        BloodHelper
      </Text>

      <Text style={styles.subtitle}>
        Expo is working!
      </Text>

      <Link href="/assign" style={styles.link}>
        Open Night Order
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#400000',
  },
  subtitle: {
    fontSize: 18,
    color: '#333333',
    marginTop: 12,
  },
  link: {
    fontSize: 18,
    color: '#0066cc',
    marginTop: 30,
  },
});
