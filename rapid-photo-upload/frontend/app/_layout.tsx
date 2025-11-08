import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Head from 'expo-router/head';
import { Providers } from '../components/Providers';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Providers>
        <Head>
          <title>Rapid Photo Upload</title>
        </Head>
        <GestureHandlerRootView style={styles.container}>
          <Stack
            screenOptions={{
              headerShown: false,
            }}
          />
        </GestureHandlerRootView>
      </Providers>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
