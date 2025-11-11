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
import { cognitoAuthService } from '../services/cognito/authService';
import '../services/cognito/config'; // Initialize Amplify
import { AuthGuard } from '../components/AuthGuard';

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();

  useEffect(() => {
    // Initialize auth state from Cognito on app startup
    const initAuth = async () => {
      try {
        const user = await cognitoAuthService.getCurrentUser();
        const accessToken = await cognitoAuthService.getAccessToken();
        
        if (user && accessToken) {
          dispatch(initializeAuth({
            user: {
              id: user.id,
              email: user.email,
              fullName: user.fullName,
              role: 'USER',
            },
            token: accessToken,
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

