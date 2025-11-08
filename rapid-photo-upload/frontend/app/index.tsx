import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native';
import { Screen } from '../components/screen';

export default function Index() {
  return (
    <Screen style={styles.container}>
      <Text style={styles.text}>Welcome to Rapid Photo Upload</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  text: {
    color: '#fff',
    fontSize: 24,
  },
});

