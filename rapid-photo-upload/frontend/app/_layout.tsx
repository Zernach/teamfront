import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, StatusBar, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Head from 'expo-router/head';
import { Providers } from '../components/Providers';
import { COLORS } from '../constants/colors';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Providers>
        <Head>
          <title>Rapid Photo Upload</title>
        </Head>
        <StatusBar
          barStyle="light-content"
          backgroundColor={COLORS.background}
          translucent={Platform.OS === 'android'}
        />
        <GestureHandlerRootView style={styles.container}>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: {
                backgroundColor: COLORS.background,
              },
              animation: 'default',
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
    backgroundColor: COLORS.background,
  },
});
