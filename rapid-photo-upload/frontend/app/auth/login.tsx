import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '../../components/screen';
import { CustomTextInput } from '../../components/custom-text-input/CustomTextInput';
import { CustomButton } from '../../components/custom-button';
import { CustomText } from '../../components/custom-text/CustomText';
import { useLogin } from '../../hooks/auth';
import { useAppSelector } from '../../hooks/redux';
import { COLORS } from '../../constants/colors';
import { PADDING } from '../../constants/styles/commonStyles';

export default function LoginScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [generalError, setGeneralError] = useState('');

  const loginMutation = useLogin();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, router]);

  const handleLogin = async () => {
    // Reset errors
    setUsernameError('');
    setPasswordError('');
    setGeneralError('');

    // Validation
    if (!username.trim()) {
      setUsernameError('Username is required');
      return;
    }

    if (!password) {
      setPasswordError('Password is required');
      return;
    }

    try {
      await loginMutation.mutateAsync({
        username: username.trim(),
        password,
      });
      // Navigation will happen via useEffect when isAuthenticated changes
      router.replace('/');
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Login failed. Please try again.';
      setGeneralError(errorMessage);
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.container}>
            <View style={styles.header}>
              <CustomText style={styles.title}>Rapid Photo Upload</CustomText>
              <CustomText style={styles.subtitle}>Sign in to continue</CustomText>
            </View>

            <View style={styles.form}>
              <CustomTextInput
                id="username"
                label="Username"
                placeholder="Enter your username"
                formattedText={username}
                onChangeText={(text) => {
                  setUsername(text);
                  setUsernameError('');
                  setGeneralError('');
                }}
                errorMessage={usernameError}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
                onSubmitEditing={() => {
                  // Focus password field
                }}
              />

              <CustomTextInput
                id="password"
                label="Password"
                placeholder="Enter your password"
                formattedText={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setPasswordError('');
                  setGeneralError('');
                }}
                errorMessage={passwordError}
                isPasswordField
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />

              {generalError ? (
                <View style={styles.errorContainer}>
                  <CustomText color={COLORS.red} style={styles.errorText}>
                    {generalError}
                  </CustomText>
                </View>
              ) : null}

              <CustomButton
                title="Sign In"
                onPress={handleLogin}
                disabled={loginMutation.isPending}
                style={styles.loginButton}
              />

              {loginMutation.isPending && (
                <View style={styles.loadingContainer}>
                  <CustomText color={COLORS.grey} style={styles.loadingText}>
                    Signing in...
                  </CustomText>
                </View>
              )}

              <View style={styles.signupLinkContainer}>
                <CustomText color={COLORS.grey} style={styles.signupLinkText}>
                  Don't have an account?{' '}
                </CustomText>
                <TouchableOpacity onPress={() => router.push('/auth/register')}>
                  <CustomText color={COLORS.primary} style={styles.signupLink}>
                    Sign Up
                  </CustomText>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: PADDING * 2,
    justifyContent: 'center',
  },
  header: {
    marginBottom: PADDING * 3,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: PADDING,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.grey,
  },
  form: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  errorContainer: {
    marginTop: PADDING,
    marginBottom: PADDING,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
  },
  loginButton: {
    marginTop: PADDING * 2,
    width: '100%',
  },
  loadingContainer: {
    marginTop: PADDING,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
  },
  signupLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: PADDING * 2,
  },
  signupLinkText: {
    fontSize: 14,
  },
  signupLink: {
    fontSize: 14,
    fontWeight: '600',
  },
});

