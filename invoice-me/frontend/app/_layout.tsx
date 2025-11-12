import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import Head from 'expo-router/head';
import { Colors } from '../constants/colors';
import { store } from '../store';

export default function RootLayout() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
        <Head>
          <title>Invoice Me</title>
        </Head>
        <GestureHandlerRootView style={styles.container}>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: {
                backgroundColor: Colors.background,
              },
            }}
          />
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});

