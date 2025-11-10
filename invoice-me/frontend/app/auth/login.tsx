import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '../../components/screen';
import { CustomTextInput } from '../../components/custom-text-input/CustomTextInput';
import { CustomButton } from '../../components/custom-button';
import { CustomText } from '../../components/custom-text/CustomText';
import { authApi, LoginRequest } from '../../services/api/authApi';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { setAuth } from '../../store/authSlice';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';

export default function LoginScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, router]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async () => {
    // Reset errors
    setEmailError('');
    setPasswordError('');
    setGeneralError('');

    // Validation
    if (!email.trim()) {
      setEmailError('Email is required');
      return;
    }

    if (!validateEmail(email.trim())) {
      setEmailError('Please enter a valid email address');
      return;
    }

    if (!password) {
      setPasswordError('Password is required');
      return;
    }

    setIsLoading(true);

    try {
      const response = await authApi.login({
        email: email.trim(),
        password,
      });

      // Dispatch auth action
      dispatch(setAuth({
        user: {
          id: response.user.id,
          email: response.user.email,
          fullName: response.user.fullName,
          role: response.user.role,
        },
        token: response.accessToken,
      }));

      // Store refresh token
      if (response.refreshToken) {
        const { tokenStorage } = await import('../../services/tokenStorage');
        tokenStorage.setRefreshToken(response.refreshToken).catch(console.error);
      }

      // Navigation will happen via useEffect when isAuthenticated changes
      router.replace('/');
    } catch (error: any) {
      const errorMessage = error?.message || 'Login failed. Please try again.';
      setGeneralError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Screen style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <View style={styles.header}>
              <CustomText style={styles.title}>Invoice Me</CustomText>
              <CustomText style={styles.subtitle}>Sign in to continue</CustomText>
            </View>

            <View style={styles.form}>
              <CustomTextInput
                id="email"
                label="Email"
                placeholder="Enter your email"
                formattedText={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setEmailError('');
                  setGeneralError('');
                }}
                errorMessage={emailError}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
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
                  <CustomText color={Colors.error} style={styles.errorText}>
                    {generalError}
                  </CustomText>
                </View>
              ) : null}

              <CustomButton
                title="Sign In"
                onPress={handleLogin}
                disabled={isLoading}
                style={styles.loginButton}
              />

              {isLoading && (
                <View style={styles.loadingContainer}>
                  <CustomText color={Colors.textSecondary} style={styles.loadingText}>
                    Signing in...
                  </CustomText>
                </View>
              )}

              <View style={styles.signupLinkContainer}>
                <CustomText color={Colors.textSecondary} style={styles.signupLinkText}>
                  Don't have an account?{' '}
                </CustomText>
                <TouchableOpacity onPress={() => router.push('/auth/signup')}>
                  <CustomText color={Colors.primary} style={styles.signupLink}>
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
  container: {
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: Spacing.xl,
    justifyContent: 'center',
  },
  header: {
    marginBottom: Spacing.xxl,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  form: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  errorContainer: {
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
  },
  loginButton: {
    marginTop: Spacing.xl,
    width: '100%',
    backgroundColor: Colors.primary,
  },
  loadingContainer: {
    marginTop: Spacing.md,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
  },
  signupLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.xl,
  },
  signupLinkText: {
    fontSize: 14,
  },
  signupLink: {
    fontSize: 14,
    fontWeight: '600',
  },
});

