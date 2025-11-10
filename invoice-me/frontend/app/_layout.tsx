import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider, useDispatch } from 'react-redux';
import Head from 'expo-router/head';
import { useEffect } from 'react';
import { Colors } from '../constants/colors';
import { store } from '../store';
import { initializeAuth } from '../store/authSlice';
import { tokenStorage } from '../services/tokenStorage';
import { AuthGuard } from '../components/AuthGuard';

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();

  useEffect(() => {
    // Initialize auth state from token storage on app startup
    const initAuth = async () => {
      try {
        const token = await tokenStorage.getAuthToken();
        if (token) {
          // Token exists, but we don't have user info without decoding JWT
          // For now, we'll set a minimal auth state. User info will be fetched on next API call
          // or when they login again. This allows the app to work if token is still valid.
          dispatch(initializeAuth({
            user: null, // Will be populated on next login or API call
            token,
          }));
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
      }
    };

    initAuth();
  }, [dispatch]);

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
        <Head>
          <title>Invoice Me</title>
        </Head>
        <AuthInitializer>
          <GestureHandlerRootView style={styles.container}>
            <AuthGuard>
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: {
                    backgroundColor: Colors.background,
                  },
                }}
              />
            </AuthGuard>
          </GestureHandlerRootView>
        </AuthInitializer>
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

