import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '../../components/screen';
import { CustomTextInput } from '../../components/custom-text-input/CustomTextInput';
import { CustomButton } from '../../components/custom-button';
import { CustomText } from '../../components/custom-text/CustomText';
import { authApi, RegisterRequest } from '../../services/api/authApi';
import { useAppDispatch } from '../../hooks/redux';
import { setAuth } from '../../store/authSlice';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';

export default function SignupScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [fullNameError, setFullNameError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSignup = async () => {
    // Reset errors
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');
    setFullNameError('');
    setGeneralError('');

    // Validation
    if (!fullName.trim()) {
      setFullNameError('Full name is required');
      return;
    }

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

    if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const registerData: RegisterRequest = {
        email: email.trim(),
        password,
        fullName: fullName.trim(),
      };

      // Register the user
      await authApi.register(registerData);

      // Automatically log in the user after successful registration
      const loginResponse = await authApi.login({
        email: email.trim(),
        password,
      });

      // Dispatch auth action to set authentication state
      dispatch(setAuth({
        user: {
          id: loginResponse.user.id,
          email: loginResponse.user.email,
          fullName: loginResponse.user.fullName,
          role: loginResponse.user.role,
        },
        token: loginResponse.accessToken,
      }));

      // Store refresh token
      if (loginResponse.refreshToken) {
        const { tokenStorage } = await import('../../services/tokenStorage');
        tokenStorage.setRefreshToken(loginResponse.refreshToken).catch(console.error);
      }

      // Navigate to home page after successful registration and login
      router.replace('/');
    } catch (error: any) {
      const errorMessage = error?.message || 'Registration failed. Please try again.';
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
              <CustomText style={styles.title}>Create Account</CustomText>
              <CustomText style={styles.subtitle}>Sign up to get started</CustomText>
            </View>

            <View style={styles.form}>
              <CustomTextInput
                id="fullName"
                label="Full Name"
                placeholder="Enter your full name"
                formattedText={fullName}
                onChangeText={(text) => {
                  setFullName(text);
                  setFullNameError('');
                  setGeneralError('');
                }}
                errorMessage={fullNameError}
                autoCapitalize="words"
                autoCorrect={false}
                returnKeyType="next"
              />

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
                returnKeyType="next"
              />

              <CustomTextInput
                id="confirmPassword"
                label="Confirm Password"
                placeholder="Confirm your password"
                formattedText={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  setConfirmPasswordError('');
                  setGeneralError('');
                }}
                errorMessage={confirmPasswordError}
                isPasswordField
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={handleSignup}
              />

              {generalError ? (
                <View style={styles.errorContainer}>
                  <CustomText color={Colors.error} style={styles.errorText}>
                    {generalError}
                  </CustomText>
                </View>
              ) : null}

              <CustomButton
                title="Sign Up"
                onPress={handleSignup}
                disabled={isLoading}
                style={styles.signupButton}
              />

              {isLoading && (
                <View style={styles.loadingContainer}>
                  <CustomText color={Colors.textSecondary} style={styles.loadingText}>
                    Creating account...
                  </CustomText>
                </View>
              )}

              <View style={styles.loginLinkContainer}>
                <CustomText color={Colors.textSecondary} style={styles.loginLinkText}>
                  Already have an account?{' '}
                </CustomText>
                <TouchableOpacity onPress={() => router.push('/auth/login')}>
                  <CustomText color={Colors.primary} style={styles.loginLink}>
                    Sign In
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
  signupButton: {
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
  loginLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.xl,
  },
  loginLinkText: {
    fontSize: 14,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '600',
  },
});

