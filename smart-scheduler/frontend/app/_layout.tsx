import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import Head from 'expo-router/head';
import Toast from 'react-native-toast-message';
import { store } from '../store';
import { COLORS } from '../constants/colors';

export default function RootLayout() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <Head>
          <title>Smart Scheduler</title>
        </Head>
        <GestureHandlerRootView style={styles.container}>
          <Stack
            screenOptions={{
              headerShown: false,
            }}
          />
          <Toast />
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});

