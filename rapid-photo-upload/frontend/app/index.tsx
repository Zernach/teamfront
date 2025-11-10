import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native';
import { Screen } from '../components/screen';
import { useRouter } from 'expo-router';
import { COLORS } from '../constants/colors';

export default function Index() {
  const router = useRouter();

  return (
    <Screen style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Rapid Photo Upload</Text>
        <Text style={styles.subtitle}>Upload and manage your photos</Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push('/upload')}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Upload Photos</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary]}
            onPress={() => router.push('/gallery')}
            activeOpacity={0.8}
          >
            <Text style={[styles.buttonText, styles.buttonTextSecondary]}>View Gallery</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  content: {
    alignItems: 'center',
    padding: 20,
  },
  title: {
    color: COLORS.white,
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: COLORS.grey,
    fontSize: 16,
    marginBottom: 40,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 300,
    gap: 16,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  buttonText: {
    color: COLORS.black,
    fontSize: 18,
    fontWeight: '600',
  },
  buttonTextSecondary: {
    color: COLORS.primary,
  },
});

